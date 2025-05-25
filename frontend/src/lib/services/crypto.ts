/**
 * Kryptografické utility funkce pro PassOwl
 */

/**
 * Generuje kryptograficky bezpečný salt
 */
export async function generateSalt(): Promise<string> {
	const array = new Uint8Array(32);
	crypto.getRandomValues(array);
	return btoa(String.fromCharCode(...array));
}

/**
 * Odvozuje klíč z hesla pomocí PBKDF2
 */
export async function deriveKey(
	password: string, 
	salt: string, 
	iterations: number = 100000
): Promise<string> {
	const encoder = new TextEncoder();
	const passwordBuffer = encoder.encode(password);
	const saltBuffer = encoder.encode(salt);

	const keyMaterial = await crypto.subtle.importKey(
		'raw',
		passwordBuffer,
		{ name: 'PBKDF2' },
		false,
		['deriveKey']
	);

	const key = await crypto.subtle.deriveKey(
		{
			name: 'PBKDF2',
			salt: saltBuffer,
			iterations: iterations,
			hash: 'SHA-256'
		},
		keyMaterial,
		{ name: 'AES-GCM', length: 256 },
		true,
		['encrypt', 'decrypt']
	);

	const keyBuffer = await crypto.subtle.exportKey('raw', key);
	return btoa(String.fromCharCode(...new Uint8Array(keyBuffer)));
}

/**
 * Generuje login hash z hesla a saltu
 */
export async function generateLoginHash(password: string, salt: string): Promise<string> {
	return deriveKey(password, salt);
}

/**
 * Generuje encryption key z master hesla
 */
export async function generateEncryptionKey(masterPassword: string, encryptionSalt: string): Promise<string> {
	return deriveKey(masterPassword, encryptionSalt);
}
