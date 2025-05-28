import { api } from './api-client';
import { generateSalt, generateLoginHash } from './crypto';
import { encryptionKeyManager } from './encryption-key-manager';
import type {
  LoginCredentials,
  RegisterCredentials,
  UserCreate,
  UserLogin,
  UserSalts,
  Token
} from './api';
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

    const registerRequest: UserCreate = {
      username: username.trim(),
      login_password_hash: loginPasswordHash,
      login_salt: loginSalt,
      encryption_salt: encryptionSalt
    };

    try {
      const response = await api.auth.registerUserAuthRegisterPost(registerRequest);
      return { data: undefined };
    } catch (error: any) {
      let errorMessage = 'Chyba při registraci';
      
      if (error.status === 400) {
        errorMessage = 'Uživatelské jméno již existuje';
      } else if (error.status === 422) {
        errorMessage = 'Neplatné údaje pro registraci';
      } else if (error.error?.detail) {
        errorMessage = error.error.detail;
      } else if (error.message) {
        errorMessage = 'Nepodařilo se připojit k serveru';
      }

      return {
        error: {
          detail: errorMessage,
          status: error.status
        }
      };
    }
  }

  /**
   * Přihlášení uživatele s odvozením šifrovacího klíče
   */
  static async login(credentials: LoginCredentials): Promise<ApiResponse<{ access_token: string; token_type: string; encryptionSalt: string }>> {
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
    } catch (error: any) {
      let errorMessage = 'Chyba při přihlášení';
      
      if (error.status === 401) {
        errorMessage = 'Nesprávné uživatelské jméno nebo heslo';
      } else if (error.status === 404) {
        errorMessage = 'Nesprávné uživatelské jméno nebo heslo';
      } else if (error.status === 400) {
        errorMessage = 'Neplatné přihlašovací údaje';
      } else if (error.status === 422) {
        errorMessage = 'Nesprávný formát přihlašovacích údajů';
      } else if (error.error?.detail) {
        errorMessage = error.error.detail;
      } else if (error.message && !error.status) {
        errorMessage = 'Nepodařilo se připojit k serveru. Zkontrolujte internetové připojení.';
      }

      return {
        error: {
          detail: errorMessage,
          status: error.status
        }
      };
    }
  }

  /**
   * Opětovné odvození klíče (když uživatel zadá master heslo)
   */
  static async rederiveKey(masterPassword: string): Promise<boolean> {
    // Zde používáme bez parametru, salt se načte z localStorage
    return await encryptionKeyManager.deriveAndStoreKey(masterPassword);
  }
}
