import { api } from './api-client';
import { 
    encryptWithPublicKey, 
    decryptWithPrivateKey, 
    encryptData, 
    decryptData, 
    generateSharingKey
} from './crypto';
import { PasswordManager } from './password-manager';
import { encryptionKeyManager } from './encryption-key-manager';
import type { 
    SharedCredentialCreate, 
    SharedCredentialResponse, 
    UserPublicKey,
    SharedUserResponse 
} from './api';
import type { ApiResponse } from '$lib/types/api';

export interface SharePasswordData {
    credentialId: number;
    recipientUserId: number;
}

export interface DecryptedSharedPassword {
    id: number;
    credentialId: number;
    ownerUserId: number;
    ownerUsername: string;
    credentialTitle: string;
    title: string;
    username: string;
    password: string;
    url?: string;
    createdAt: string;
}

export class SharingManager {
    /**
     * Kontrola dostupnosti privátního klíče
     */
    private static ensurePrivateKeyAvailable(): string {
        const privateKey = encryptionKeyManager.getPrivateKey();
        if (!privateKey) {
            throw new Error('Privátní klíč není dostupný. Zadejte prosím master heslo.');
        }
        encryptionKeyManager.refreshKeyLifetime();
        return privateKey;
    }

    /**
     * Sdílení hesla s jiným uživatelem
     */
    static async sharePassword(shareData: SharePasswordData): Promise<ApiResponse<SharedCredentialResponse>> {
        try {
            // 1. Dešifrovat původní heslo
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

            // 4. Zašifrovat data hesla sharing_key
            const dataToShare = JSON.stringify({
                title: decryptedPassword.data.title,
                username: decryptedPassword.data.username,
                password: decryptedPassword.data.password,
                url: decryptedPassword.data.url
            });

            const { encryptedData: encryptedSharedData, iv: sharingIv } = await encryptData(
                dataToShare, 
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
            // Nyní response.data je SharedCredentialListResponse s items a total
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
     * Dešifrování sdíleného hesla - ZJEDNODUŠENÉ BEZ MASTER HESLA
     */
    static async decryptSharedPassword(
        sharedCredential: SharedCredentialResponse
    ): Promise<ApiResponse<DecryptedSharedPassword>> {
        try {
            // 1. Získat privátní klíč z paměti (už je dešifrovaný)
            const privateKey = this.ensurePrivateKeyAvailable();

            // 2. Dešifrovat sharing_key pomocí privátního klíče
            const sharingKey = await decryptWithPrivateKey(sharedCredential.encrypted_sharing_key, privateKey);

            // 3. Dešifrovat data hesla pomocí sharing_key
            const decryptedDataString = await decryptData(
                sharedCredential.encrypted_shared_data, 
                sharedCredential.sharing_iv, 
                sharingKey
            );

            const passwordData = JSON.parse(decryptedDataString);

            const result: DecryptedSharedPassword = {
                id: sharedCredential.id,
                credentialId: sharedCredential.credential_id,
                ownerUserId: sharedCredential.owner_user_id,
                ownerUsername: sharedCredential.owner_username,
                credentialTitle: sharedCredential.credential_title,
                title: passwordData.title,
                username: passwordData.username,
                password: passwordData.password,
                url: passwordData.url,
                createdAt: sharedCredential.created_at
            };

            return { data: result };

        } catch (error: any) {
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
            if (query.length < 2) {
                return { data: [] };
            }

            const response = await api.api.searchUsersApiSharingUsersSearchGet({ q: query });
            return { data: response.data };
        } catch (error: any) {
            return {
                error: {
                    detail: error.error?.detail || error.message || 'Nepodařilo se vyhledat uživatele',
                    status: error.status || 500
                }
            };
        }
    }

    /**
     * Zrušení sdílení hesla
     */
    static async unsharePassword(sharedCredentialId: number): Promise<ApiResponse<void>> {
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
     * Kontrola dostupnosti privátního klíče
     */
    static isPrivateKeyAvailable(): boolean {
        return encryptionKeyManager.isPrivateKeyAvailable();
    }
}