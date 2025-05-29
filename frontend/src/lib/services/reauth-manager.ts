import { writable } from 'svelte/store';
import { encryptionKeyManager } from './encryption-key-manager';
import { AuthStore } from '$lib/stores/auth';
import { goto } from '$app/navigation';

class ReauthManager {
    private checkInterval: number | null = null;
    private readonly CHECK_INTERVAL_MS = 60 * 1000; // kontrola každou minutu

    // Store pro řízení UI
    public showReauthModal = writable(false);
    public isReauthInProgress = writable(false);

    /**
     * Spustí pravidelnou kontrolu platnosti klíče
     */
    startMonitoring() {        
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }

        this.checkInterval = setInterval(() => {
            this.checkKeyValidity();
        }, this.CHECK_INTERVAL_MS);

        // Okamžitá kontrola
        this.checkKeyValidity();
    }

    /**
     * Zastaví monitoring
     */
    stopMonitoring() {        
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        this.showReauthModal.set(false);
        this.isReauthInProgress.set(false);
    }

    /**
     * Kontrola platnosti šifrovacího klíče
     */
    private checkKeyValidity() {
        // Pokud uživatel není přihlášen, nezkoumáme
        if (!AuthStore.getAccessToken()) {
            return;
        }

        // Kontrola, zda je klíč dostupný
        if (!encryptionKeyManager.isKeyAvailable()) {
            this.triggerReauth();
        }
    }

    /**
     * Spustí proces re-autentizace
     */
    private triggerReauth() {
        this.isReauthInProgress.set(true);
        this.showReauthModal.set(true);
    }

    /**
     * Úspěšná re-autentizace
     */
    onReauthSuccess() {
        this.showReauthModal.set(false);
        this.isReauthInProgress.set(false);
    }

    /**
     * Timeout nebo neúspěšná re-autentizace - odhlášení
     */
    onReauthTimeout() {
        this.stopMonitoring();
        AuthStore.logout();
        goto('/login');
    }

    /**
     * Manuální trigger re-autentizace (např. z error handleru)
     */
    requestReauth(): boolean {
        if (!encryptionKeyManager.isKeyAvailable()) {
            this.triggerReauth();
            return true; // indikace, že byla spuštěna re-autentizace
        }
        return false;
    }
}

export const reauthManager = new ReauthManager();