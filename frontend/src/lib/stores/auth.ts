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
	USERNAME: 'username'
} as const;

export class AuthStore {
	/**
	 * Inicializace auth stavu z localStorage
	 */
	static initialize() {
		if (!browser) return;

		const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
		const username = localStorage.getItem(STORAGE_KEYS.USERNAME);

		if (token && username) {
			// Dynamický import api klienta
			import('$lib/services/api-client').then(({ api }) => {
				api.setSecurityData(token);
			});
			authUser.set({ username, isLoggedIn: true });
		}
	}

	/**
	 * Uložení auth dat po úspěšném přihlášení
	 */
	static setAuthData(token: string, username: string, encryptionSalt: string) {
		if (!browser) return;

		localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
		localStorage.setItem(STORAGE_KEYS.USERNAME, username);
		localStorage.setItem(STORAGE_KEYS.ENCRYPTION_SALT, encryptionSalt);

		// Dynamický import api klienta
		import('$lib/services/api-client').then(({ api }) => {
			api.setSecurityData(token);
		});

		authUser.set({ username, isLoggedIn: true });
	}

	/**
	 * Odhlášení uživatele
	 */
	static logout() {
		if (!browser) return;

		localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
		localStorage.removeItem(STORAGE_KEYS.USERNAME);
		localStorage.removeItem(STORAGE_KEYS.ENCRYPTION_SALT);

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
