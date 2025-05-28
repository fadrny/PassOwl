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
 * Generuje kryptograficky bezpečný IV (Initialization Vector)
 */
export async function generateIV(): Promise<string> {
    const array = new Uint8Array(12); // 12 bytů pro AES-GCM
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

/**
 * Převede base64 string na CryptoKey pro šifrování/dešifrování
 */
async function importKeyFromBase64(keyBase64: string): Promise<CryptoKey> {
    const keyBuffer = Uint8Array.from(atob(keyBase64), c => c.charCodeAt(0));
    
    return await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
    );
}

/**
 * Šifruje data pomocí AES-256-GCM
 */
export async function encryptData(plaintext: string, encryptionKeyBase64: string): Promise<{ encryptedData: string; iv: string }> {
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    
    // Generování IV
    const iv = await generateIV();
    const ivBuffer = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
    
    // Import klíče
    const key = await importKeyFromBase64(encryptionKeyBase64);
    
    // Šifrování
    const encryptedBuffer = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: ivBuffer
        },
        key,
        data
    );
    
    // Konverze na base64
    const encryptedData = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));
    
    return { encryptedData, iv };
}

/**
 * Dešifruje data pomocí AES-256-GCM
 */
export async function decryptData(encryptedDataBase64: string, ivBase64: string, encryptionKeyBase64: string): Promise<string> {
    try {
        // Konverze z base64
        const encryptedBuffer = Uint8Array.from(atob(encryptedDataBase64), c => c.charCodeAt(0));
        const ivBuffer = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
        
        // Import klíče
        const key = await importKeyFromBase64(encryptionKeyBase64);
        
        // Dešifrování
        const decryptedBuffer = await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: ivBuffer
            },
            key,
            encryptedBuffer
        );
        
        // Konverze zpět na string
        const decoder = new TextDecoder();
        return decoder.decode(decryptedBuffer);
    } catch (error) {
        throw new Error('Nepodařilo se dešifrovat data. Možná je poškozený klíč nebo data.');
    }
}
