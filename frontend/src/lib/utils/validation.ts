import type { LoginCredentials, RegisterCredentials } from '$lib/types/auth';

export interface ValidationResult {
	isValid: boolean;
	errors: string[];
}

/**
 * Validace přihlašovacích údajů
 */
export function validateLoginCredentials(credentials: LoginCredentials): ValidationResult {
	const errors: string[] = [];

	if (!credentials.username.trim()) {
		errors.push('Zadejte uživatelské jméno');
	}

	if (!credentials.password) {
		errors.push('Zadejte heslo');
	}

	return {
		isValid: errors.length === 0,
		errors
	};
}

/**
 * Validace registračních údajů
 */
export function validateRegisterCredentials(credentials: RegisterCredentials): ValidationResult {
	const errors: string[] = [];

	if (!credentials.username.trim()) {
		errors.push('Zadejte uživatelské jméno');
	}

	if (credentials.username.trim().length < 3) {
		errors.push('Uživatelské jméno musí mít alespoň 3 znaky');
	}

	if (!credentials.password) {
		errors.push('Zadejte heslo');
	}

	if (credentials.password.length < 8) {
		errors.push('Heslo musí mít alespoň 8 znaků');
	}

	if (credentials.password !== credentials.passwordConfirm) {
		errors.push('Hesla se neshodují');
	}

	return {
		isValid: errors.length === 0,
		errors
	};
}
