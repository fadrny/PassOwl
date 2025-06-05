import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { encryptionKeyManager } from '$lib/services/encryption-key-manager';
import type { AuthUser } from '$lib/types/auth';

// Auth state
export const authUser = writable<AuthUser>({ username: '', isLoggedIn: false, avatarUrl: undefined });

// Storage keys
const STORAGE_KEYS = {
    ACCESS_TOKEN: 'access_token',
    ENCRYPTION_SALT: 'encryption_salt',
    USERNAME: 'username',
    AVATAR_URL: 'avatar_url'
} as const;

export class AuthStore {
    /**
     * Inicializace auth stavu z localStorage
     */
    static initialize() {
        if (!browser) return;

        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
        const avatarUrl = localStorage.getItem(STORAGE_KEYS.AVATAR_URL);

        if (token && username) {
            // Dynamický import api klienta
            import('$lib/services/api-client').then(({ api }) => {
                api.setSecurityData(token);
                
                // Načteme aktuální informace o uživateli z API
                this.refreshUserInfo();
            });
            
            authUser.set({ 
                username, 
                isLoggedIn: true,
                avatarUrl: avatarUrl || undefined
            });
        }
    }

    /**
     * Načtení aktuálních informací o uživateli z API
     */
    static async refreshUserInfo() {
        if (!browser) return;
        
        try {
            const { api } = await import('$lib/services/api-client');
            const userInfo = await api.users.getCurrentUserInfoUsersMeGet();
            
            // Aktualizace avatar URL pokud se liší
            if (userInfo.data.avatar_url) {
                const currentAvatarUrl = localStorage.getItem(STORAGE_KEYS.AVATAR_URL);
                if (currentAvatarUrl !== userInfo.data.avatar_url) {
                    this.updateAvatarUrl(userInfo.data.avatar_url);
                }
            }
        } catch (error) {
            console.error('Chyba při načítání informací o uživateli:', error);
        }
    }

    /**
     * Uložení auth dat po úspěšném přihlášení
     */
    static setAuthData(token: string, username: string, encryptionSalt: string, avatarUrl?: string) {
        if (!browser) return;

        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USERNAME, username);
        localStorage.setItem(STORAGE_KEYS.ENCRYPTION_SALT, encryptionSalt);
        
        if (avatarUrl) {
            localStorage.setItem(STORAGE_KEYS.AVATAR_URL, avatarUrl);
        }

        // Dynamický import api klienta
        import('$lib/services/api-client').then(({ api }) => {
            api.setSecurityData(token);
        });

        authUser.set({ 
            username, 
            isLoggedIn: true,
            avatarUrl
        });
    }

    /**
     * Aktualizace avatar URL
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
        localStorage.removeItem(STORAGE_KEYS.AVATAR_URL);

        // Vymazání šifrovacího klíče z paměti
        encryptionKeyManager.clearKey();

        // Dynamický import api klienta
        import('$lib/services/api-client').then(({ api }) => {
            api.setSecurityData(null);
        });

        authUser.set({ username: '', isLoggedIn: false, avatarUrl: undefined });
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

    /**
     * Získání uživatelského jména
     */
    static getUsername(): string | null {
        if (!browser) return null;
        return localStorage.getItem(STORAGE_KEYS.USERNAME);
    }

    /**
     * Získání avatar URL
     */
    static getAvatarUrl(): string | null {
        if (!browser) return null;
        return localStorage.getItem(STORAGE_KEYS.AVATAR_URL);
    }
}
