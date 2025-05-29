import { api } from './api-client';
import { encryptData, decryptData } from './crypto';
import { encryptionKeyManager } from './encryption-key-manager';
import type { Credential, CredentialCreate, CredentialUpdate } from './api';
import type { ApiResponse } from '$lib/types/api';

/**
 * Struktura dešifrovaného hesla (pro frontend zobrazení)
 */
export interface DecryptedPassword {
  id: number;
  title: string;           // plaintext z API
  username: string;        // plaintext z API
  password: string;        // dešifrované z encrypted_data
  url?: string | null;     // plaintext z API
  categories?: Array<{ id: number; name: string; color_hex?: string | null }>;
  created_at: string;
  updated_at: string;
}

/**
 * Struktura pro vytvoření nového hesla (frontend input)
 */
export interface PasswordCreateData {
  title: string;
  username: string;
  password: string;        // bude zašifrováno do encrypted_data
  url?: string;
  categoryIds?: number[];
}

/**
 * Struktura pro aktualizaci hesla (frontend input)
 */
export interface PasswordUpdateData {
  title?: string;
  username?: string;
  password?: string;       // bude zašifrováno do encrypted_data
  url?: string | null;
  categoryIds?: number[];
}

export class PasswordManager {
  /**
   * Kontrola dostupnosti šifrovacího klíče
   */
  private static ensureKeyAvailable(): string {
    const encryptionKey = encryptionKeyManager.getEncryptionKey();
    if (!encryptionKey) {
      throw new Error('Šifrovací klíč není dostupný. Zadejte prosím master heslo.');
    }
    encryptionKeyManager.refreshKeyLifetime();
    return encryptionKey;
  }

  /**
   * Šifrování POUZE hesla podle API specifikace
   */
  private static async encryptPassword(password: string): Promise<{ encryptedData: string; iv: string }> {
    const encryptionKey = this.ensureKeyAvailable();
    
    // Šifrujeme pouze heslo
    const encryption = await encryptData(password, encryptionKey);
    
    return {
      encryptedData: encryption.encryptedData,
      iv: encryption.iv
    };
  }

  /**
   * Dešifrování hesla z credential
   */
  private static async decryptPasswordData(credential: Credential): Promise<DecryptedPassword> {
    const encryptionKey = this.ensureKeyAvailable();

    try {
      // Dešifrování pouze hesla z encrypted_data
      const password = await decryptData(credential.encrypted_data, credential.encryption_iv, encryptionKey);

      return {
        id: credential.id,
        title: credential.title,                    // plaintext z API
        username: credential.username,              // plaintext z API
        password: password,                         // dešifrované heslo
        url: credential.url,                        // plaintext z API
        categories: credential.categories,          // plaintext z API
        created_at: credential.created_at,
        updated_at: credential.updated_at
      };
    } catch (error) {
      console.error('Chyba při dešifrování hesla:', error);
      throw new Error(`Nepodařilo se dešifrovat heslo ID ${credential.id}`);
    }
  }

  /**
   * Získání seznamu hesel (podle API specifikace)
   */
  static async getPasswords(params?: { skip?: number; limit?: number }): Promise<ApiResponse<Credential[]>> {
    try {
      const response = await api.credentials.getCredentialsCredentialsGet(params || {});
      return { data: response.data };
    } catch (error: any) {
      console.error('API error getting passwords:', error);
      
      if (error.status === 401) {
        return {
          error: {
            detail: 'Nejste přihlášeni. Přihlaste se prosím.',
            status: 401
          }
        };
      }
      
      return {
        error: {
          detail: error.error?.detail || error.message || 'Chyba při načítání hesel',
          status: error.status || 500
        }
      };
    }
  }

  /**
   * Dešifrování konkrétního hesla
   */
  static async decryptPassword(credential: Credential): Promise<ApiResponse<DecryptedPassword>> {
    try {
      const decryptedPassword = await this.decryptPasswordData(credential);
      return { data: decryptedPassword };
    } catch (error: any) {
      return {
        error: {
          detail: error.message || 'Nepodařilo se dešifrovat heslo',
          status: 500
        }
      };
    }
  }

  /**
   * Vytvoření nového hesla (podle API specifikace)
   */
  static async createPassword(passwordData: PasswordCreateData): Promise<ApiResponse<Credential>> {
    try {
      // Šifrování pouze hesla
      const { encryptedData, iv } = await this.encryptPassword(passwordData.password);

      // Příprava dat podle CredentialCreate z API
      const credentialCreate: CredentialCreate = {
        title: passwordData.title,                  // plaintext
        username: passwordData.username,            // plaintext
        url: passwordData.url || null,              // plaintext
        encrypted_data: encryptedData,              // šifrované heslo
        encryption_iv: iv,                          // IV pro dešifrování
        category_ids: passwordData.categoryIds || []
      };

      const response = await api.credentials.createCredentialCredentialsPost(credentialCreate);
      return { data: response.data };
    } catch (error: any) {
      console.error('API error creating password:', error);
      
      return {
        error: {
          detail: error.error?.detail || error.message || 'Nepodařilo se vytvořit heslo',
          status: error.status || 500
        }
      };
    }
  }

  /**
   * Aktualizace hesla (podle API specifikace)
   */
  static async updatePassword(id: number, passwordData: PasswordUpdateData): Promise<ApiResponse<Credential>> {
    try {
      // Příprava dat podle CredentialUpdate z API
      const credentialUpdate: CredentialUpdate = {
        title: passwordData.title || null,
        username: passwordData.username || null,
        url: passwordData.url || null,
        category_ids: passwordData.categoryIds || null
      };

      // Pokud se mění heslo, zašifrujeme ho
      if (passwordData.password) {
        const { encryptedData, iv } = await this.encryptPassword(passwordData.password);
        credentialUpdate.encrypted_data = encryptedData;
        credentialUpdate.encryption_iv = iv;
      }

      const response = await api.credentials.updateCredentialCredentialsCredentialIdPut(id, credentialUpdate);
      return { data: response.data };
    } catch (error: any) {
      return {
        error: {
          detail: error.error?.detail || error.message || 'Nepodařilo se aktualizovat heslo',
          status: error.status || 500
        }
      };
    }
  }

  /**
   * Smazání hesla (podle API specifikace)
   */
  static async deletePassword(id: number): Promise<ApiResponse<void>> {
    try {
      await api.credentials.deleteCredentialCredentialsCredentialIdDelete(id);
      return { data: undefined };
    } catch (error: any) {
      return {
        error: {
          detail: error.error?.detail || error.message || 'Nepodařilo se smazat heslo',
          status: error.status || 500
        }
      };
    }
  }

  /**
   * Kontrola dostupnosti šifrovacího klíče
   */
  static isEncryptionKeyAvailable(): boolean {
    return encryptionKeyManager.isKeyAvailable();
  }
}