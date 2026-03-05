import { api } from './api-client';
import { generateSalt, generateLoginHash, generateRSAKeyPair, encryptPrivateKey } from './crypto';
import { encryptionKeyManager } from './encryption-key-manager';
import type { UserCreate, UserLogin, UserSalts, Token } from './api';
import { getApiErrorDetail, getApiErrorStatus, type ApiResponse } from '$lib/types/api';

export interface RegisterCredentials {
	username: string;
	password: string;
}

export interface LoginCredentials {
	username: string;
	password: string;
}

interface JwtPayload {
	sub?: string;
}

export class AuthService {
	/**
	 * Registrace nového uživatele s generováním asymetrických klíčů
	 */
	static async register(credentials: RegisterCredentials): Promise<ApiResponse<void>> {
		const { username, password } = credentials;

		try {
			// Generování saltů
			const loginSalt = await generateSalt();
			const encryptionSalt = await generateSalt();

			// Generování login hashe
			const loginPasswordHash = await generateLoginHash(password, loginSalt);

			// Generování asymetrických klíčů
			const { publicKey, privateKey } = await generateRSAKeyPair();

			// Zašifrování privátního klíče master heslem
			const { encryptedPrivateKey, iv } = await encryptPrivateKey(
				privateKey,
				password,
				encryptionSalt
			);

			const registerRequest: UserCreate = {
				username: username.trim(),
				login_password_hash: loginPasswordHash,
				login_salt: loginSalt,
				encryption_salt: encryptionSalt,
				public_key: publicKey,
				encrypted_private_key: `${encryptedPrivateKey}:${iv}` // Uložíme s IV
			};

			await api.auth.registerUserAuthRegisterPost(registerRequest);
			return { data: undefined };
		} catch (error: unknown) {
			let errorMessage = 'Chyba při registraci';
			const status = getApiErrorStatus(error);

			if (status === 400) {
				errorMessage = 'Uživatelské jméno již existuje';
			} else if (status === 422) {
				errorMessage = 'Nesprávný formát dat';
			} else if (!status) {
				errorMessage = 'Nepodařilo se připojit k serveru. Zkontrolujte internetové připojení.';
			} else {
				errorMessage = getApiErrorDetail(error, errorMessage);
			}

			return {
				error: {
					detail: errorMessage,
					status
				}
			};
		}
	}

	/**
	 * Přihlášení uživatele s odvozením šifrovacího klíče
	 */
	static async login(
		credentials: LoginCredentials
	): Promise<ApiResponse<{ access_token: string; token_type: string; encryptionSalt: string }>> {
		const { username, password } = credentials;

		try {
			// Získání saltů
			const saltsResponse = await api.auth.getUserSaltsAuthSaltsGet({ username: username.trim() });
			const salts = saltsResponse.data as UserSalts;
			const { login_salt, encryption_salt } = salts;

			// Generování login hashe
			const loginPasswordHash = await generateLoginHash(password, login_salt);

			const loginRequest: UserLogin = {
				username: username.trim(),
				login_password_hash: loginPasswordHash
			};

			// Přihlášení
			const loginResponse = await api.auth.loginUserAuthLoginPost(loginRequest);
			const token = loginResponse.data as Token;

			// Nastavení tokenu pro další API volání
			api.setSecurityData(token.access_token);

			// DŮLEŽITÉ: Odvození a uložení šifrovacího klíče do paměti
			// Předáváme encryption_salt přímo, protože ještě není v localStorage
			const keyDerived = await encryptionKeyManager.deriveAndStoreKey(password, encryption_salt);
			if (!keyDerived) {
				return {
					error: {
						detail: 'Nepodařilo se odvodit šifrovací klíč',
						status: 500
					}
				};
			}

			// Přidání encryption saltu k odpovědi
			return {
				data: {
					access_token: token.access_token,
					token_type: token.token_type,
					encryptionSalt: encryption_salt
				}
			};
		} catch (error: unknown) {
			let errorMessage = 'Chyba při přihlášení';
			const status = getApiErrorStatus(error);

			if (status === 401) {
				errorMessage = 'Nesprávné uživatelské jméno nebo heslo';
			} else if (status === 404) {
				errorMessage = 'Nesprávné uživatelské jméno nebo heslo';
			} else if (status === 400) {
				errorMessage = 'Neplatné přihlašovací údaje';
			} else if (status === 422) {
				errorMessage = 'Nesprávný formát přihlašovacích údajů';
			} else if (!status) {
				errorMessage = 'Nepodařilo se připojit k serveru. Zkontrolujte internetové připojení.';
			} else {
				errorMessage = getApiErrorDetail(error, errorMessage);
			}

			return {
				error: {
					detail: errorMessage,
					status
				}
			};
		}
	}

	/**
	 * Opětovné odvození klíče s ověřením hesla přes backend
	 */
	static async rederiveKey(masterPassword: string): Promise<boolean> {
		try {
			// Nejdříve musíme ověřit heslo přes backend
			const authResult = await this.verifyPasswordAndGetNewToken(masterPassword);

			if (!authResult.success) {
				console.error('Ověření hesla selhalo:', authResult.error);
				return false;
			}

			// Teprve po úspěšném ověření odvozujeme klíč
			const keySuccess = await encryptionKeyManager.deriveAndStoreKey(masterPassword);

			if (!keySuccess) {
				console.error('Odvození klíče selhalo i přes správné heslo');
				return false;
			}

			console.log('🔑 Klíč byl úspěšně znovu odvozen s novým JWT tokenem');
			return true;
		} catch (error) {
			console.error('Error during reauth:', error);
			return false;
		}
	}

	/**
	 * Ověření hesla přes backend a získání nového JWT tokenu
	 */
	private static async verifyPasswordAndGetNewToken(masterPassword: string): Promise<{
		success: boolean;
		error?: string;
		token?: string;
	}> {
		try {
			// Získáme aktuální username z localStorage
			const { AuthStore } = await import('$lib/stores/auth');
			const currentToken = AuthStore.getAccessToken();

			if (!currentToken) {
				return { success: false, error: 'Chybí přihlašovací token' };
			}

			// Dekódujeme JWT token pro získání username (jednoduché dekódování bez verifikace)
			const payload = this.decodeJwtPayload(currentToken);
			if (!payload || !payload.sub) {
				return { success: false, error: 'Neplatný token' };
			}

			const username = payload.sub;

			// Získání saltů pro uživatele
			const saltsResponse = await api.auth.getUserSaltsAuthSaltsGet({ username });
			const salts = saltsResponse.data as UserSalts;
			const { login_salt } = salts;

			// Generování login hashe pro ověření
			const loginPasswordHash = await generateLoginHash(masterPassword, login_salt);

			const loginRequest: UserLogin = {
				username,
				login_password_hash: loginPasswordHash
			};

			// Pokus o přihlášení (ověření hesla)
			const loginResponse = await api.auth.loginUserAuthLoginPost(loginRequest);
			const token = loginResponse.data as Token;

			// Aktualizace tokenu v aplikaci
			api.setSecurityData(token.access_token);

			// NEJLEPŠÍ ŘEŠENÍ: Načíst fresh data z API po reauth
			try {
				const userInfo = await api.users.getCurrentUserInfoUsersMeGet();
				AuthStore.setAuthData(
					token.access_token,
					username,
					AuthStore.getEncryptionSalt()!,
					userInfo.data.avatar_url || undefined
				);
			} catch (error) {
				console.error('Chyba při načítání user info po reauth:', error);
				// Fallback - zachovat současný avatar
				const currentAvatarUrl = AuthStore.getAvatarUrl();
				AuthStore.setAuthData(
					token.access_token,
					username,
					AuthStore.getEncryptionSalt()!,
					currentAvatarUrl ? currentAvatarUrl : undefined
				);
			}

			return {
				success: true,
				token: token.access_token
			};
		} catch (error: unknown) {
			let errorMessage = 'Ověření hesla selhalo';
			const status = getApiErrorStatus(error);

			if (status === 401) {
				errorMessage = 'Nesprávné heslo';
			} else if (status === 404) {
				errorMessage = 'Uživatel nenalezen';
			} else {
				errorMessage = getApiErrorDetail(error, errorMessage);
			}

			return {
				success: false,
				error: errorMessage
			};
		}
	}

	/**
	 * Jednoduché dekódování JWT payload (bez verifikace)
	 */
	private static decodeJwtPayload(token: string): JwtPayload | null {
		try {
			const parts = token.split('.');
			if (parts.length !== 3) {
				return null;
			}

			const payload = parts[1];
			const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
			return JSON.parse(decoded);
		} catch (error) {
			console.error('Error decoding JWT:', error);
			return null;
		}
	}

	/**
	 * Opětovné odvození klíče s refreshem JWT tokenu (alias pro zpětnou kompatibilitu)
	 */
	static async rederiveKeyWithTokenRefresh(masterPassword: string): Promise<boolean> {
		return this.rederiveKey(masterPassword);
	}
}
