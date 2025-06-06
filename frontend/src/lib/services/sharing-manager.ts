import { api } from './api-client';
import { encryptData, decryptData, encryptWithPublicKey, decryptWithPrivateKey, generateSharingKey } from './crypto';
import { PasswordManager } from './password-manager';
import { KeyManager } from './key-manager';
import { encryptionKeyManager } from './encryption-key-manager';
import type { SharedCredentialResponse, SharedCredentialCreate, SharedUserResponse, SharedCredentialUpdate } from './api';
import type { ApiResponse } from '$lib/types/api';

/**
 * Struktura pro sdílení hesla
 */
export interface SharePasswordData {
    credentialId: number;
    recipientUserId: number;
}

/**
 * Struktura dešifrovaného sdíleného hesla
 */
export interface DecryptedSharedPassword {
    id: number;
    title: string;
    username: string;
    password: string;
    url?: string | null;
    owner_username: string;
    created_at: string;
}

export class SharingManager {
    /**
     * Kontrola dostupnosti privátního klíče
     */
    private static ensurePrivateKeyAvailable(): string {
        // SPRÁVNÝ způsob - použít encryptionKeyManager.getPrivateKey()
        const privateKey = encryptionKeyManager.getPrivateKey();
        
        if (!privateKey) {
            throw new Error('Privátní klíč není dostupný pro dešifrování sdílených dat. Přihlaste se prosím znovu.');
        }
        
        // Prodloužit životnost klíče při použití
        encryptionKeyManager.refreshKeyLifetime();
        
        return privateKey;
    }

    /**
     * Sdílení hesla s jiným uživatelem - AKTUALIZOVÁNO PRO NOVÉ API
     */
    static async sharePassword(shareData: SharePasswordData): Promise<ApiResponse<SharedCredentialResponse>> {
        try {
            // 1. Dešifrovat původní heslo (pouze password pole)
            const credentialResponse = await api.credentials.getCredentialCredentialsCredentialIdGet(shareData.credentialId);
            const credential = credentialResponse.data;
            
            const decryptedPassword = await PasswordManager.decryptPassword(credential);
            if (decryptedPassword.error || !decryptedPassword.data) {
                return { error: { detail: 'Nepodařilo se dešifrovat heslo', status: 500 } };
            }

            // 2. Získat veřejný klíč příjemce
            const publicKeyResponse = await api.api.getUserPublicKeyApiSharingUsersUserIdPublicKeyGet(shareData.recipientUserId);
            const recipientPublicKey = publicKeyResponse.data.public_key;

            // 3. Vytvořit sharing_key
            const sharingKey = await generateSharingKey();

            // 4. Zašifrovat POUZE heslo pomocí sharing_key (title, username, url už jsou nešifrované)
            const passwordToShare = decryptedPassword.data.password;

            const { encryptedData: encryptedSharedData, iv: sharingIv } = await encryptData(
                passwordToShare, 
                sharingKey
            );

            // 5. Zašifrovat sharing_key veřejným klíčem příjemce
            const encryptedSharingKey = await encryptWithPublicKey(sharingKey, recipientPublicKey);

            // 6. Odeslat na server
            const shareRequest: SharedCredentialCreate = {
                credential_id: shareData.credentialId,
                recipient_user_id: shareData.recipientUserId,
                encrypted_sharing_key: encryptedSharingKey,
                encrypted_shared_data: encryptedSharedData,
                sharing_iv: sharingIv
            };

            const response = await api.api.shareCredentialApiSharingSharePost(shareRequest);
            return { data: response.data };

        } catch (error: any) {
            return {
                error: {
                    detail: error.error?.detail || error.message || 'Nepodařilo se sdílet heslo',
                    status: error.status || 500
                }
            };
        }
    }

    /**
     * Získání seznamu uživatelů, se kterými je sdíleno konkrétní heslo
     */
    static async getCredentialSharedUsers(credentialId: number): Promise<ApiResponse<SharedUserResponse[]>> {
        try {
            const response = await api.api.getCredentialSharedUsersApiSharingCredentialCredentialIdUsersGet(credentialId);
            return { data: response.data };
        } catch (error: any) {
            return {
                error: {
                    detail: error.error?.detail || error.message || 'Nepodařilo se načíst sdílené uživatele',
                    status: error.status || 500
                }
            };
        }
    }

    /**
     * Zrušení sdílení hesla s konkrétním uživatelem
     */
    static async removeCredentialSharing(credentialId: number, userId: number): Promise<ApiResponse<void>> {
        try {
            await api.api.deleteCredentialSharingApiSharingCredentialCredentialIdUserUserIdDelete(credentialId, userId);
            return { data: undefined };
        } catch (error: any) {
            return {
                error: {
                    detail: error.error?.detail || error.message || 'Nepodařilo se zrušit sdílení',
                    status: error.status || 500
                }
            };
        }
    }

    /**
     * Získání sdílených hesel (přijatých)
     */
    static async getSharedPasswords(params?: { 
        skip?: number; 
        limit?: number;
    }): Promise<ApiResponse<{ items: SharedCredentialResponse[]; total: number }>> {
        try {
            const response = await api.api.getReceivedSharedCredentialsApiSharingReceivedGet(params);
            return { data: { items: response.data.items, total: response.data.total } };
        } catch (error: any) {
            return {
                error: {
                    detail: error.error?.detail || error.message || 'Nepodařilo se načíst sdílená hesla',
                    status: error.status || 500
                }
            };
        }
    }

    /**
     * Dešifrování sdíleného hesla - OPRAVENO
     */
    static async decryptSharedPassword(
        sharedCredential: SharedCredentialResponse
    ): Promise<ApiResponse<DecryptedSharedPassword>> {
        try {
            // Kontrola dostupnosti privátního klíče
            if (!encryptionKeyManager.isPrivateKeyAvailable()) {
                return {
                    error: {
                        detail: 'Privátní klíč není dostupný. Možná vypršela vaše session, přihlaste se prosím znovu.',
                        status: 401
                    }
                };
            }

            const privateKey = this.ensurePrivateKeyAvailable();

            console.log('Attempting to decrypt shared password:', {
                id: sharedCredential.id,
                hasPrivateKey: !!privateKey,
                encryptedKeyLength: sharedCredential.encrypted_sharing_key?.length || 0
            });

            // 1. Dešifrovat sharing_key pomocí privátního klíče
            const sharingKey = await decryptWithPrivateKey(
                sharedCredential.encrypted_sharing_key, 
                privateKey
            );

            console.log('Sharing key decrypted, length:', sharingKey?.length || 0);

            // 2. Dešifrovat pouze heslo pomocí sharing_key
            const decryptedPassword = await decryptData(
                sharedCredential.encrypted_shared_data,
                sharedCredential.sharing_iv,
                sharingKey
            );

            console.log('Password decrypted successfully');

            // 3. Sestavit výsledek - použijeme nešifrované údaje z API
            const result: DecryptedSharedPassword = {
                id: sharedCredential.id,
                title: sharedCredential.credential_title,        // již nešifrované
                username: sharedCredential.credential_username,  // již nešifrované
                password: decryptedPassword,                     // dešifrované
                url: sharedCredential.credential_url,            // již nešifrované
                owner_username: sharedCredential.owner_username,
                created_at: sharedCredential.created_at
            };

            return { data: result };

        } catch (error: any) {
            console.error('Error decrypting shared password:', error);
            return {
                error: {
                    detail: error.message || 'Nepodařilo se dešifrovat sdílené heslo',
                    status: 500
                }
            };
        }
    }

    /**
     * Vyhledání uživatelů pro sdílení
     */
    static async searchUsers(query: string): Promise<ApiResponse<Array<{ id: number; username: string }>>> {
        try {
            const result = await KeyManager.searchUsers(query);
            return result;
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
     * Zrušení sdílení hesla
     */
    static async deleteSharedCredential(sharedCredentialId: number): Promise<ApiResponse<void>> {
        try {
            await api.api.deleteSharedCredentialApiSharingSharedCredentialIdDelete(sharedCredentialId);
            return { data: undefined };
        } catch (error: any) {
            return {
                error: {
                    detail: error.error?.detail || error.message || 'Nepodařilo se zrušit sdílení',
                    status: error.status || 500
                }
            };
        }
    }

    /**
     * NOVÁ METODA: Aktualizace sdíleného hesla po změně původního hesla
     */
    static async updateSharedPassword(credentialId: number, recipientUserId: number): Promise<ApiResponse<SharedCredentialResponse>> {
        try {
            console.log(`Aktualizuji sdílení hesla ${credentialId} pro uživatele ${recipientUserId}`);

            // 1. Dešifrovat aktuální heslo
            const credentialResponse = await api.credentials.getCredentialCredentialsCredentialIdGet(credentialId);
            const credential = credentialResponse.data;
            
            const decryptedPassword = await PasswordManager.decryptPassword(credential);
            if (decryptedPassword.error || !decryptedPassword.data) {
                return { error: { detail: 'Nepodařilo se dešifrovat aktualizované heslo', status: 500 } };
            }

            // 2. Získat veřejný klíč příjemce
            const publicKeyResponse = await api.api.getUserPublicKeyApiSharingUsersUserIdPublicKeyGet(recipientUserId);
            const recipientPublicKey = publicKeyResponse.data.public_key;

            // 3. Vytvořit nový sharing_key
            const sharingKey = await generateSharingKey();

            // 4. Zašifrovat POUZE nové heslo pomocí sharing_key
            const newPasswordToShare = decryptedPassword.data.password;

            const { encryptedData: encryptedSharedData, iv: sharingIv } = await encryptData(
                newPasswordToShare, 
                sharingKey
            );

            // 5. Zašifrovat sharing_key veřejným klíčem příjemce
            const encryptedSharingKey = await encryptWithPublicKey(sharingKey, recipientPublicKey);

            // 6. Aktualizovat sdílení na serveru
            const updateRequest: SharedCredentialUpdate = {
                encrypted_sharing_key: encryptedSharingKey,
                encrypted_shared_data: encryptedSharedData,
                sharing_iv: sharingIv
            };

            const response = await api.api.updateCredentialSharingApiSharingCredentialCredentialIdUserUserIdPut(
                credentialId, 
                recipientUserId, 
                updateRequest
            );

            console.log(`Sdílení pro uživatele ${recipientUserId} úspěšně aktualizováno`);
            return { data: response.data };

        } catch (error: any) {
            console.error(`Chyba při aktualizaci sdílení pro uživatele ${recipientUserId}:`, error);
            return {
                error: {
                    detail: error.error?.detail || error.message || 'Nepodařilo se aktualizovat sdílené heslo',
                    status: error.status || 500
                }
            };
        }
    }
}