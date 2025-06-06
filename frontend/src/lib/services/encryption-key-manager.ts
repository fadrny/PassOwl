import { browser } from '$app/environment';
import { generateEncryptionKey, decryptPrivateKey } from './crypto';
import { AuthStore } from '$lib/stores/auth';
import { api } from './api-client';

/**
 * Správa šifrovacího klíče a privátního klíče v paměti během sezení
 */
class EncryptionKeyManager {
    private encryptionKey: string | null = null;
    private keyDerivedAt: number | null = null;
    private privateKey: string | null = null; // Nový privátní klíč
    private privateKeyDerivedAt: number | null = null; // Časové razítko privátního klíče
    private readonly KEY_LIFETIME_MS = 15 * 60 * 1000; // 15 minut

    /**
     * Odvození a uložení šifrovacího klíče do paměti
     */
    async deriveAndStoreKey(masterPassword: string, encryptionSalt?: string): Promise<boolean> {
        if (!browser) return false;

        try {
            // Pokud není salt předán jako parametr, zkus ho získat z localStorage
            let salt = encryptionSalt;
            if (!salt) {
                const { AuthStore } = await import('$lib/stores/auth');
                salt = AuthStore.getEncryptionSalt() || undefined;
            }

            if (!salt) {
                throw new Error('Encryption salt nebyl nalezen');
            }

            this.encryptionKey = await generateEncryptionKey(masterPassword, salt);
            this.keyDerivedAt = Date.now();
            
            // Současně dešifruj a ulož privátní klíč
            await this.deriveAndStorePrivateKey(masterPassword, salt);
            
            console.log('Šifrovací klíč byl úspěšně odvozen a uložen do paměti');
            return true;
        } catch (error) {
            console.error('Chyba při odvození šifrovacího klíče:', error);
            this.clearKey();
            return false;
        }
    }

    /**
     * Odvození a uložení privátního klíče do paměti
     */
    private async deriveAndStorePrivateKey(masterPassword: string, encryptionSalt: string): Promise<void> {
        try {
            // Získání informací o uživateli včetně klíčů
            const userResponse = await api.users.getCurrentUserInfoUsersMeGet();
            const user = userResponse.data;

            if (!user.encrypted_private_key) {
                console.log('Uživatel nemá vygenerované asymetrické klíče');
                return;
            }

            // Rozdělení encrypted_private_key na data a IV
            const [encryptedPrivateKey, iv] = user.encrypted_private_key.split(':');

            // Dešifrování privátního klíče
            this.privateKey = await decryptPrivateKey(encryptedPrivateKey, iv, masterPassword, encryptionSalt);
            this.privateKeyDerivedAt = Date.now();
            
            console.log('Privátní klíč byl úspěšně dešifrován a uložen do paměti');
        } catch (error) {
            console.error('Chyba při dešifrování privátního klíče:', error);
            // Privátní klíč není kritický pro základní funkčnost, takže nekončíme celý proces
        }
    }

    /**
     * Získání šifrovacího klíče (s kontrolou platnosti)
     */
    getEncryptionKey(): string | null {
        if (!this.encryptionKey || !this.keyDerivedAt) {
            return null;
        }

        // Kontrola platnosti klíče
        const now = Date.now();
        if (now - this.keyDerivedAt > this.KEY_LIFETIME_MS) {
            console.log('Šifrovací klíč vypršel, vymazává se z paměti');
            this.clearKey();
            return null;
        }

        return this.encryptionKey;
    }

    /**
     * Získání privátního klíče (s kontrolou platnosti)
     */
    getPrivateKey(): string | null {
        if (!this.privateKey || !this.privateKeyDerivedAt) {
            return null;
        }

        // Kontrola platnosti klíče (stejná jako u encryption key)
        const now = Date.now();
        if (now - this.privateKeyDerivedAt > this.KEY_LIFETIME_MS) {
            console.log('Privátní klíč vypršel, vymazává se z paměti');
            this.clearPrivateKey();
            return null;
        }

        return this.privateKey;
    }

    /**
     * Kontrola, zda je klíč dostupný
     */
    isKeyAvailable(): boolean {
        return this.getEncryptionKey() !== null;
    }

    /**
     * Kontrola, zda je privátní klíč dostupný
     */
    isPrivateKeyAvailable(): boolean {
        return this.getPrivateKey() !== null;
    }

    /**
     * Vymazání klíče z paměti
     */
    clearKey(): void {
        this.encryptionKey = null;
        this.keyDerivedAt = null;
        this.clearPrivateKey();
        console.log('Šifrovací klíč byl vymazán z paměti');
    }

    /**
     * Vymazání pouze privátního klíče z paměti
     */
    private clearPrivateKey(): void {
        this.privateKey = null;
        this.privateKeyDerivedAt = null;
        console.log('Privátní klíč byl vymazán z paměti');
    }

    /**
     * Prodloužení životnosti klíče (při aktivní práci uživatele)
     */
    refreshKeyLifetime(): void {
        if (this.encryptionKey && this.keyDerivedAt) {
            this.keyDerivedAt = Date.now();
        }
        if (this.privateKey && this.privateKeyDerivedAt) {
            this.privateKeyDerivedAt = Date.now();
        }
    }
}

// Singleton instance
export const encryptionKeyManager = new EncryptionKeyManager();

// Automatické vymazání klíče při odhlášení
if (browser) {
    // Vymazání klíče při zavření/obnovení stránky
    window.addEventListener('beforeunload', () => {
        encryptionKeyManager.clearKey();
    });
}