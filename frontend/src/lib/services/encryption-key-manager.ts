import { browser } from '$app/environment';
import { generateEncryptionKey } from './crypto';

/**
 * Správa šifrovacího klíče v paměti během sezení
 */
class EncryptionKeyManager {
    private encryptionKey: string | null = null;
    private keyDerivedAt: number | null = null;
    private readonly KEY_LIFETIME_MS = 10 * 60 * 1000; // 10 minut

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
                salt = AuthStore.getEncryptionSalt();
            }

            if (!salt) {
                throw new Error('Encryption salt nebyl nalezen');
            }

            this.encryptionKey = await generateEncryptionKey(masterPassword, salt);
            this.keyDerivedAt = Date.now();
            
            console.log('Šifrovací klíč byl úspěšně odvozen a uložen do paměti');
            return true;
        } catch (error) {
            console.error('Chyba při odvození šifrovacího klíče:', error);
            this.clearKey();
            return false;
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
     * Kontrola, zda je klíč dostupný
     */
    isKeyAvailable(): boolean {
        return this.getEncryptionKey() !== null;
    }

    /**
     * Vymazání klíče z paměti
     */
    clearKey(): void {
        this.encryptionKey = null;
        this.keyDerivedAt = null;
        console.log('Šifrovací klíč byl vymazán z paměti');
    }

    /**
     * Prodloužení životnosti klíče (při aktivní práci uživatele)
     */
    refreshKeyLifetime(): void {
        if (this.encryptionKey && this.keyDerivedAt) {
            this.keyDerivedAt = Date.now();
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