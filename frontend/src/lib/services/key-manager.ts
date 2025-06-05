import { api } from './api-client';
import { 
    generateRSAKeyPair, 
    encryptPrivateKey, 
    decryptPrivateKey,
    encryptWithPublicKey,
    decryptWithPrivateKey,
    generateSharingKey,
    encryptData,
    decryptData
} from './crypto';
import { encryptionKeyManager } from './encryption-key-manager';
import { AuthStore } from '$lib/stores/auth';
import type { ApiResponse } from '$lib/types/api';
import type { UserPublicKey } from './api';

/**
 * Struktura pro uložení klíčů v paměti
 */
interface CachedKeys {
    publicKey: string;
    privateKey: string;
    privateKeyIv: string;
}

/**
 * Správce asymetrických klíčů pro sdílení
 */
export class KeyManager {
    private static cachedKeys: CachedKeys | null = null;

    /**
     * Generuje a uloží nové asymetrické klíče pro uživatele
     */
    static async generateAndStoreKeys(masterPassword: string): Promise<ApiResponse<void>> {
        try {
            const encryptionSalt = AuthStore.getEncryptionSalt();
            if (!encryptionSalt) {
                return { error: { detail: 'Encryption salt nenalezen', status: 500 } };
            }

            // Generování klíčů
            const { publicKey, privateKey } = await generateRSAKeyPair();
            
            // Zašifrování privátního klíče master heslem
            const { encryptedPrivateKey, iv } = await encryptPrivateKey(privateKey, masterPassword, encryptionSalt);

            // Odeslání na server
            const response = await api.users.updateUserKeysUsersKeysPut({
                public_key: publicKey,
                encrypted_private_key: `${encryptedPrivateKey}:${iv}` // Uložíme s IV
            });

            // Cache klíčů
            this.cachedKeys = {
                publicKey,
                privateKey,
                privateKeyIv: iv
            };

            return { data: undefined };
        } catch (error: any) {
            return {
                error: {
                    detail: error.error?.detail || error.message || 'Nepodařilo se vygenerovat klíče',
                    status: error.status || 500
                }
            };
        }
    }

    /**
     * Načte a dešifruje privátní klíč uživatele
     */
    static async loadPrivateKey(masterPassword?: string): Promise<string | null> {
        try {
            // Pokud máme klíče v cache, použijeme je
            if (this.cachedKeys) {
                return this.cachedKeys.privateKey;
            }

            // Získání informací o uživateli včetně klíčů
            const userResponse = await api.users.getCurrentUserInfoUsersMeGet();
            const user = userResponse.data;

            if (!user.encrypted_private_key) {
                return null;
            }

            // Rozdělení encrypted_private_key na data a IV
            const [encryptedPrivateKey, iv] = user.encrypted_private_key.split(':');
            
            // Pokud není master heslo poskytnuté, zkusíme použít současný encryption key
            let password = masterPassword;
            if (!password) {
                const currentKey = encryptionKeyManager.getEncryptionKey();
                if (!currentKey) {
                    throw new Error('Master heslo je vyžadováno pro dešifrování privátního klíče');
                }
                // Zde bychom potřebovali původní master heslo, ne derived key
                throw new Error('Zadejte master heslo pro dešifrování privátního klíče');
            }

            const encryptionSalt = AuthStore.getEncryptionSalt();
            if (!encryptionSalt) {
                throw new Error('Encryption salt nenalezen');
            }

            // Dešifrování privátního klíče
            const privateKey = await decryptPrivateKey(encryptedPrivateKey, iv, password, encryptionSalt);

            // Cache klíčů pro budoucí použití
            this.cachedKeys = {
                publicKey: user.public_key || '',
                privateKey,
                privateKeyIv: iv
            };

            return privateKey;
        } catch (error) {
            console.error('Chyba při načítání privátního klíče:', error);
            return null;
        }
    }

    /**
     * Získá veřejný klíč jiného uživatele
     */
    static async getUserPublicKey(userId: number): Promise<ApiResponse<UserPublicKey>> {
        try {
            const response = await api.api.getUserPublicKeyApiSharingUsersUserIdPublicKeyGet(userId);
            return { data: response.data };
        } catch (error: any) {
            return {
                error: {
                    detail: error.error?.detail || 'Nepodařilo se získat veřejný klíč uživatele',
                    status: error.status || 500
                }
            };
        }
    }

    /**
     * Vyhledá uživatele pro sdílení
     */
    static async searchUsers(query: string): Promise<ApiResponse<Array<{ id: number; username: string }>>> {
        try {
            const response = await api.api.searchUsersApiSharingUsersSearchGet({ q: query });
            return { data: response.data };
        } catch (error: any) {
            return {
                error: {
                    detail: error.error?.detail || 'Nepodařilo se vyhledat uživatele',
                    status: error.status || 500
                }
            };
        }
    }

    /**
     * Vymaže cache klíčů
     */
    static clearCache(): void {
        this.cachedKeys = null;
    }

    /**
     * Kontrola, zda má uživatel vygenerované klíče
     */
    static async hasKeys(): Promise<boolean> {
        try {
            const userResponse = await api.users.getCurrentUserInfoUsersMeGet();
            return !!(userResponse.data.public_key && userResponse.data.encrypted_private_key);
        } catch {
            return false;
        }
    }
}