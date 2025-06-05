import { api } from './api-client';
import { encryptData, decryptData } from './crypto';
import { encryptionKeyManager } from './encryption-key-manager';
import type { SecureNote, SecureNoteCreate, SecureNoteUpdate, SecureNoteListResponse } from './api';
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
    const key = encryptionKeyManager.getEncryptionKey();
    if (!key) {
      throw new Error('Šifrovací klíč není dostupný. Přihlaste se prosím.');
    }
    encryptionKeyManager.refreshKeyLifetime();
    return key;
  }

  /**
   * Šifrování poznámky (title a content zvlášť se stejným IV)
   */
  private static async encryptNote(title: string, content: string): Promise<{ encryptedTitle: string; encryptedContent: string; iv: string }> {
    const key = this.ensureKeyAvailable();
    
    // Použijeme stejné IV pro title i content
    const { encryptedData: encryptedTitle, iv } = await encryptData(title, key);
    const { encryptedData: encryptedContent } = await encryptData(content, key, iv);
    
    return {
      encryptedTitle,
      encryptedContent,
      iv
    };
  }

  /**
   * Dešifrování poznámky z SecureNote
   */
  private static async decryptNoteData(note: SecureNote): Promise<DecryptedNote> {
    const key = this.ensureKeyAvailable();
    
    const title = await decryptData(note.encrypted_title, note.encryption_iv, key);
    const content = await decryptData(note.encrypted_content, note.encryption_iv, key);
    
    return {
      id: note.id,
      title,
      content,
      created_at: note.created_at,
      updated_at: note.updated_at
    };
  }

  /**
   * Získání seznamu poznámek s pagination
   */
  static async getNotes(params?: { 
    skip?: number; 
    limit?: number 
  }): Promise<ApiResponse<{ items: SecureNote[]; total: number }>> {
    try {
      const response = await api.secureNotes.getSecureNotesSecureNotesGet(params);
      // Nyní response.data je SecureNoteListResponse s items a total
      return { data: { items: response.data.items, total: response.data.total } };
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
      const decrypted = await this.decryptNoteData(note);
      return { data: decrypted };
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