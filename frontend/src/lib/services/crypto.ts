
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
    const array = new Uint8Array(12);
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
 * Šifruje data pomocí AES-GCM
 */
export async function encryptData(plaintext: string, keyBase64: string, customIv?: string): Promise<{ encryptedData: string; iv: string }> {
    const key = await importKeyFromBase64(keyBase64);
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    
    let iv: Uint8Array;
    let ivBase64: string;
    
    if (customIv) {
        iv = Uint8Array.from(atob(customIv), c => c.charCodeAt(0));
        ivBase64 = customIv;
    } else {
        iv = crypto.getRandomValues(new Uint8Array(12));
        ivBase64 = btoa(String.fromCharCode(...iv));
    }
    
    const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        data
    );
    
    const encryptedData = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));
    
    return { encryptedData, iv: ivBase64 };
}

/**
 * Dešifruje data pomocí AES-GCM
 */
export async function decryptData(encryptedData: string, ivBase64: string, keyBase64: string): Promise<string> {
    const key = await importKeyFromBase64(keyBase64);
    
    const encryptedBuffer = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
    
    const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encryptedBuffer
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
}


/**
 * Generuje pár RSA klíčů pro asymetrické šifrování
 */
export async function generateRSAKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
    const keyPair = await crypto.subtle.generateKey(
        {
            name: 'RSA-OAEP',
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: 'SHA-256',
        },
        true,
        ['encrypt', 'decrypt']
    );

    // Export veřejného klíče
    const publicKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
    const publicKey = btoa(String.fromCharCode(...new Uint8Array(publicKeyBuffer)));

    // Export privátního klíče
    const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
    const privateKey = btoa(String.fromCharCode(...new Uint8Array(privateKeyBuffer)));

    return { publicKey, privateKey };
}

/**
 * Zašifruje privátní klíč pomocí master hesla uživatele
 */
export async function encryptPrivateKey(privateKey: string, masterPassword: string, encryptionSalt: string): Promise<{ encryptedPrivateKey: string; iv: string }> {
    const encryptionKey = await generateEncryptionKey(masterPassword, encryptionSalt);
    return await encryptData(privateKey, encryptionKey);
}

/**
 * Dešifruje privátní klíč pomocí master hesla uživatele
 */
export async function decryptPrivateKey(encryptedPrivateKey: string, iv: string, masterPassword: string, encryptionSalt: string): Promise<string> {
    const encryptionKey = await generateEncryptionKey(masterPassword, encryptionSalt);
    return await decryptData(encryptedPrivateKey, iv, encryptionKey);
}

/**
 * Zašifruje data pomocí veřejného klíče RSA
 */
export async function encryptWithPublicKey(data: string, publicKeyBase64: string): Promise<string> {
    const publicKeyBuffer = Uint8Array.from(atob(publicKeyBase64), c => c.charCodeAt(0));
    const publicKey = await crypto.subtle.importKey(
        'spki',
        publicKeyBuffer,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        false,
        ['encrypt']
    );

    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        publicKey,
        dataBuffer
    );
    
    return btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));
}

/**
 * Dešifruje data pomocí privátního klíče RSA
 */
export async function decryptWithPrivateKey(encryptedData: string, privateKeyBase64: string): Promise<string> {
    const privateKeyBuffer = Uint8Array.from(atob(privateKeyBase64), c => c.charCodeAt(0));
    const privateKey = await crypto.subtle.importKey(
        'pkcs8',
        privateKeyBuffer,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        false,
        ['decrypt']
    );

    const encryptedBuffer = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    
    const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        privateKey,
        encryptedBuffer
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
}

/**
 * Generuje náhodný symetrický klíč pro sdílení
 */
export async function generateSharingKey(): Promise<string> {
    const key = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
    
    const keyBuffer = await crypto.subtle.exportKey('raw', key);
    return btoa(String.fromCharCode(...new Uint8Array(keyBuffer)));
}
