import { api } from './api-client';
import { encryptData, decryptData } from './crypto';
import { encryptionKeyManager } from './encryption-key-manager';
import type { SecureNote, SecureNoteCreate, SecureNoteUpdate } from './api';
import type { ApiResponse } from '$lib/types/api';

/**
 * Struktura dešifrované poznámky (pro frontend zobrazení)
 */
export interface DecryptedNote {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

/**
 * Struktura pro vytvoření nové poznámky (frontend input)
 */
export interface NoteCreateData {
  title: string;
  content: string;
}

/**
 * Struktura pro aktualizaci poznámky (frontend input)
 */
export interface NoteUpdateData {
  title?: string;
  content?: string;
}

export class NotesManager {
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
   * Šifrování poznámky (title a content zvlášť se stejným IV)
   */
  private static async encryptNote(title: string, content: string): Promise<{ encryptedTitle: string; encryptedContent: string; iv: string }> {
    const encryptionKey = this.ensureKeyAvailable();
    
    // Šifrujeme title
    const titleEncryption = await encryptData(title, encryptionKey);
    // Šifrujeme content se stejným IV
    const contentEncryption = await encryptData(content, encryptionKey, titleEncryption.iv);
    
    return {
      encryptedTitle: titleEncryption.encryptedData,
      encryptedContent: contentEncryption.encryptedData,
      iv: titleEncryption.iv
    };
  }

  /**
   * Dešifrování poznámky z SecureNote
   */
  private static async decryptNoteData(note: SecureNote): Promise<DecryptedNote> {
    const encryptionKey = this.ensureKeyAvailable();
    
    try {
      const decryptedTitle = await decryptData(note.encrypted_title, note.encryption_iv, encryptionKey);
      const decryptedContent = await decryptData(note.encrypted_content, note.encryption_iv, encryptionKey);
      
      return {
        id: note.id,
        title: decryptedTitle,
        content: decryptedContent,
        created_at: note.created_at,
        updated_at: note.updated_at
      };
    } catch (error) {
      console.error('Decryption error for note:', note.id, error);
      throw new Error('Nepodařilo se dešifrovat poznámku');
    }
  }

  /**
   * Získání seznamu poznámek
   */
  static async getNotes(params?: { skip?: number; limit?: number }): Promise<ApiResponse<SecureNote[]>> {
    try {
      const response = await api.secureNotes.getSecureNotesSecureNotesGet(params);
      return { data: response.data };
    } catch (error: any) {
      console.error('API error getting notes:', error);
      
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
          detail: error.error?.detail || error.message || 'Chyba při načítání poznámek',
          status: error.status || 500
        }
      };
    }
  }

  /**
   * Dešifrování konkrétní poznámky
   */
  static async decryptNote(note: SecureNote): Promise<ApiResponse<DecryptedNote>> {
    try {
      const decryptedNote = await this.decryptNoteData(note);
      return { data: decryptedNote };
    } catch (error: any) {
      return {
        error: {
          detail: error.message || 'Nepodařilo se dešifrovat poznámku',
          status: 500
        }
      };
    }
  }

  /**
   * Vytvoření nové poznámky
   */
  static async createNote(noteData: NoteCreateData): Promise<ApiResponse<SecureNote>> {
    try {
      const { encryptedTitle, encryptedContent, iv } = await this.encryptNote(noteData.title, noteData.content);

      const secureNoteCreate: SecureNoteCreate = {
        encrypted_title: encryptedTitle,
        encrypted_content: encryptedContent,
        encryption_iv: iv
      };

      const response = await api.secureNotes.createSecureNoteSecureNotesPost(secureNoteCreate);
      return { data: response.data };
    } catch (error: any) {
      console.error('API error creating note:', error);
      
      return {
        error: {
          detail: error.error?.detail || error.message || 'Nepodařilo se vytvořit poznámku',
          status: error.status || 500
        }
      };
    }
  }

  /**
   * Aktualizace poznámky
   */
  static async updateNote(id: number, noteData: NoteUpdateData): Promise<ApiResponse<SecureNote>> {
    try {
      // Pro update potřebujeme získat aktuální data, pokud se nemění oboje
      let title: string;
      let content: string;

      if (noteData.title === undefined || noteData.content === undefined) {
        // Získáme aktuální poznámku a dešifrujeme ji
        const currentResponse = await api.secureNotes.getSecureNoteSecureNotesNoteIdGet(id);
        const decrypted = await this.decryptNoteData(currentResponse.data);
        
        title = noteData.title !== undefined ? noteData.title : decrypted.title;
        content = noteData.content !== undefined ? noteData.content : decrypted.content;
      } else {
        title = noteData.title;
        content = noteData.content;
      }

      const { encryptedTitle, encryptedContent, iv } = await this.encryptNote(title, content);

      const secureNoteUpdate: SecureNoteUpdate = {
        encrypted_title: encryptedTitle,
        encrypted_content: encryptedContent,
        encryption_iv: iv
      };

      const response = await api.secureNotes.updateSecureNoteSecureNotesNoteIdPut(id, secureNoteUpdate);
      return { data: response.data };
    } catch (error: any) {
      return {
        error: {
          detail: error.error?.detail || error.message || 'Nepodařilo se aktualizovat poznámku',
          status: error.status || 500
        }
      };
    }
  }

  /**
   * Smazání poznámky
   */
  static async deleteNote(id: number): Promise<ApiResponse<void>> {
    try {
      await api.secureNotes.deleteSecureNoteSecureNotesNoteIdDelete(id);
      return { data: undefined };
    } catch (error: any) {
      return {
        error: {
          detail: error.error?.detail || error.message || 'Nepodařilo se smazat poznámku',
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