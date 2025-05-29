<script lang="ts">
    import Modal from '../ui/Modal.svelte';
    import Input from '../ui/Input.svelte';
    import Button from '../ui/Button.svelte';
    import ErrorMessage from '../ui/ErrorMessage.svelte';
    import { AuthService } from '$lib/services/auth';

    interface Props {
        open: boolean;
        onSuccess: () => void;
        onTimeout: () => void;
        timeoutMinutes?: number;
    }

    let { open, onSuccess, onTimeout, timeoutMinutes = 10 }: Props = $props();

    let masterPassword = $state('');
    let loading = $state(false);
    let error = $state('');
    let timeLeft = $state(timeoutMinutes * 60); // v sekundách

    let timeoutInterval: NodeJS.Timeout | null = null;

    // Odpočítávání času
    $effect(() => {
        if (open) {
            timeLeft = timeoutMinutes * 60;
            masterPassword = '';
            error = '';
            
            timeoutInterval = setInterval(() => {
                timeLeft--;
                if (timeLeft <= 0) {
                    handleTimeout();
                }
            }, 1000);
        } else {
            if (timeoutInterval) {
                clearInterval(timeoutInterval);
                timeoutInterval = null;
            }
        }

        // Cleanup při unmount
        return () => {
            if (timeoutInterval) {
                clearInterval(timeoutInterval);
            }
        };
    });

    function formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    function handleTimeout() {
        if (timeoutInterval) {
            clearInterval(timeoutInterval);
            timeoutInterval = null;
        }
        onTimeout();
    }

    async function handleSubmit() {
        if (!masterPassword.trim()) {
            error = 'Zadejte master heslo';
            return;
        }

        loading = true;
        error = '';

        try {
            // Ověření hesla a odvození nového klíče
            const success = await AuthService.rederiveKey(masterPassword);
            
            if (success) {
                if (timeoutInterval) {
                    clearInterval(timeoutInterval);
                    timeoutInterval = null;
                }
                onSuccess();
            } else {
                error = 'Nesprávné master heslo';
            }
        } catch (err) {
            console.error('Reauth error:', err);
            error = 'Nastala chyba při ověřování';
        } finally {
            loading = false;
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSubmit();
        }
    }
</script>

<Modal 
    open={open} 
    onClose={() => {}} 
    title="Potvrzení totožnosti" 
    closeOnBackdrop={false} 
    closeOnEscape={false}
    showCloseButton={false}
>
    {#snippet children()}
        <div class="space-y-4">
            <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div class="flex">
                    <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-yellow-800">
                            Šifrovací klíč vypršel
                        </h3>
                        <p class="mt-1 text-sm text-yellow-700">
                            Pro pokračování v práci s aplikací zadejte své master heslo. Heslo bude ověřeno a bude vygenerován nový přihlašovací token.
                        </p>
                        <p class="mt-1 text-sm text-yellow-600 font-medium">
                            Zbývající čas: {formatTime(timeLeft)}
                        </p>
                    </div>
                </div>
            </div>

            <Input
                type="password"
                label="Master heslo"
                bind:value={masterPassword}
                onkeydown={handleKeydown}
                disabled={loading}
                autofocus
                placeholder="Zadejte své master heslo"
            />

            {#if error}
                <ErrorMessage message={error} />
            {/if}
        </div>
    {/snippet}

    {#snippet footer()}
        <div class="flex justify-end space-x-3">
            <Button 
                variant="secondary" 
                onclick={handleTimeout}
                disabled={loading}
            >
                Odhlásit se
            </Button>
            <Button 
                variant="primary" 
                onclick={handleSubmit} 
                disabled={loading || !masterPassword.trim()}
                loading={loading}
            >
                {loading ? 'Ověřování...' : 'Potvrdit'}
            </Button>
        </div>
    {/snippet}
</Modal>