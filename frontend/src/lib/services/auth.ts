import { ApiService } from './api';
import { generateSalt, generateLoginHash } from './crypto';
import type { 
	LoginCredentials, 
	RegisterCredentials, 
	LoginResponse, 
	SaltsResponse, 
	RegisterRequest,
	LoginRequest
} from '$lib/types/auth';
import type { ApiResponse } from '$lib/types/api';

export class AuthService {
	/**
	 * Registrace nového uživatele
	 */
	static async register(credentials: RegisterCredentials): Promise<ApiResponse<void>> {
		const { username, password } = credentials;

		// Generování saltů
		const loginSalt = await generateSalt();
		const encryptionSalt = await generateSalt();

		// Generování login hashe
		const loginPasswordHash = await generateLoginHash(password, loginSalt);

		const registerRequest: RegisterRequest = {
			username: username.trim(),
			login_password_hash: loginPasswordHash,
			login_salt: loginSalt,
			encryption_salt: encryptionSalt
		};

		return ApiService.post<void>('/auth/register', registerRequest);
	}

	/**
	 * Přihlášení uživatele
	 */
	static async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse & { encryptionSalt: string }>> {
		const { username, password } = credentials;

		// Získání saltů
		const saltsResponse = await ApiService.get<SaltsResponse>(
			`/auth/salts?username=${encodeURIComponent(username.trim())}`
		);

		if (saltsResponse.error) {
			return { error: saltsResponse.error };
		}

		const { login_salt, encryption_salt } = saltsResponse.data!;

		// Generování login hashe
		const loginPasswordHash = await generateLoginHash(password, login_salt);

		const loginRequest: LoginRequest = {
			username: username.trim(),
			login_password_hash: loginPasswordHash
		};

		// Přihlášení
		const loginResponse = await ApiService.post<LoginResponse>('/auth/login', loginRequest);

		if (loginResponse.error) {
			return { error: loginResponse.error };
		}

		// Přidání encryption saltu k odpovědi
		return {
			data: {
				...loginResponse.data!,
				encryptionSalt: encryption_salt
			}
		};
	}
}
