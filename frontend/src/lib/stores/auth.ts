import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { encryptionKeyManager } from '$lib/services/encryption-key-manager';
import type { AuthUser } from '$lib/types/auth';

// Auth state
export const authUser = writable<AuthUser>({ username: '', isLoggedIn: false });

// Storage keys
const STORAGE_KEYS = {
    ACCESS_TOKEN: 'access_token',
    ENCRYPTION_SALT: 'encryption_salt',
    USERNAME: 'username',
    AVATAR_URL: 'avatar_url' // Přidáme pouze toto
} as const;

export class AuthStore {
    /**
     * Inicializace auth stavu z localStorage
     */
    static initialize() {
        if (!browser) return;

        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
        const avatarUrl = localStorage.getItem(STORAGE_KEYS.AVATAR_URL); // Přidáme pouze toto

        if (token && username) {
            // Dynamický import api klienta
            import('$lib/services/api-client').then(({ api }) => {
                api.setSecurityData(token);
            });
            authUser.set({ 
                username, 
                isLoggedIn: true,
                avatarUrl: avatarUrl || undefined // Přidáme pouze toto
            });
        }
    }

    /**
     * Uložení auth dat po úspěšném přihlášení
     */
    static setAuthData(token: string, username: string, encryptionSalt: string, avatarUrl?: string) { // Rozšíříme parametry
        if (!browser) return;

        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USERNAME, username);
        localStorage.setItem(STORAGE_KEYS.ENCRYPTION_SALT, encryptionSalt);
        
        if (avatarUrl) { // Přidáme pouze toto
            localStorage.setItem(STORAGE_KEYS.AVATAR_URL, avatarUrl);
        }

        // Dynamický import api klienta
        import('$lib/services/api-client').then(({ api }) => {
            api.setSecurityData(token);
        });

        authUser.set({ 
            username, 
            isLoggedIn: true,
            avatarUrl // Přidáme pouze toto
        });
    }

    /**
     * Aktualizace avatar URL - NOVÁ METODA
     */
    static updateAvatarUrl(avatarUrl: string) {
        if (!browser) return;

        localStorage.setItem(STORAGE_KEYS.AVATAR_URL, avatarUrl);
        
        authUser.update(user => ({
            ...user,
            avatarUrl
        }));
    }

    /**
     * Odhlášení uživatele
     */
    static logout() {
        if (!browser) return;

        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USERNAME);
        localStorage.removeItem(STORAGE_KEYS.ENCRYPTION_SALT);
        localStorage.removeItem(STORAGE_KEYS.AVATAR_URL); // Přidáme pouze toto

        // Vymazání šifrovacího klíče z paměti
        encryptionKeyManager.clearKey();

        // Dynamický import api klienta
        import('$lib/services/api-client').then(({ api }) => {
            api.setSecurityData(null);
        });

        authUser.set({ username: '', isLoggedIn: false });
    }

    /**
     * Získání access tokenu
     */
    static getAccessToken(): string | null {
        if (!browser) return null;
        return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    }

    /**
     * Získání encryption saltu
     */
    static getEncryptionSalt(): string | null {
        if (!browser) return null;
        return localStorage.getItem(STORAGE_KEYS.ENCRYPTION_SALT);
    }
}
