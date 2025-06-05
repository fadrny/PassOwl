import { api } from './api-client';
import { 
    encryptWithPublicKey, 
    decryptWithPrivateKey, 
    encryptData, 
    decryptData, 
    generateSharingKey,
    decryptPrivateKey
} from './crypto';
import { PasswordManager } from './password-manager';
import { encryptionKeyManager } from './encryption-key-manager';
import { AuthStore } from '$lib/stores/auth';
import type { 
    SharedCredentialCreate, 
    SharedCredentialResponse, 
    UserPublicKey 
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
     * Získání sdílených hesel (přijatých)
     */
    static async getSharedPasswords(): Promise<ApiResponse<SharedCredentialResponse[]>> {
        try {
            const response = await api.api.getReceivedSharedCredentialsApiSharingReceivedGet();
            return { data: response.data };
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
     * Dešifrování sdíleného hesla
     */
    static async decryptSharedPassword(
        sharedCredential: SharedCredentialResponse, 
        masterPassword: string
    ): Promise<ApiResponse<DecryptedSharedPassword>> {
        try {
            // 1. Získat encryption salt aktuálního uživatele
            const encryptionSalt = AuthStore.getEncryptionSalt();
            if (!encryptionSalt) {
                return { error: { detail: 'Encryption salt nenalezen', status: 500 } };
            }

            // 2. Získat zašifrovaný privátní klíč aktuálního uživatele
            const userResponse = await api.users.getCurrentUserInfoUsersMeGet();
            const currentUser = userResponse.data;
            
            if (!currentUser.encrypted_private_key) {
                return { error: { detail: 'Privátní klíč nenalezen', status: 500 } };
            }

            // 3. Dešifrovat privátní klíč pomocí master hesla
            const [encryptedPrivateKey, iv] = currentUser.encrypted_private_key.split(':');
            const privateKey = await decryptPrivateKey(encryptedPrivateKey, iv, masterPassword, encryptionSalt);

            // 4. Dešifrovat sharing_key pomocí privátního klíče
            const sharingKey = await decryptWithPrivateKey(sharedCredential.encrypted_sharing_key, privateKey);

            // 5. Dešifrovat data hesla pomocí sharing_key
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
}