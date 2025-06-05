<script lang="ts">
    import Modal from './Modal.svelte';
    import Button from '../ui/Button.svelte';
    import Input from '../ui/Input.svelte';
    import ErrorMessage from '../ui/ErrorMessage.svelte';

    interface Props {
        open: boolean;
        title?: string;
        description?: string;
        onConfirm: (masterPassword: string) => Promise<void>;
        onClose: () => void;
    }

    let { 
        open, 
        title = 'Zadejte master heslo',
        description = 'Pro dešifrování hesla je potřeba zadat vaše master heslo.',
        onConfirm, 
        onClose 
    }: Props = $props();

    let masterPassword = $state('');
    let loading = $state(false);
    let errors: string[] = $state([]);

    function resetForm() {
        masterPassword = '';
        loading = false;
        errors = [];
    }

    function handleClose() {
        resetForm();
        onClose();
    }

    async function handleSubmit() {
        if (!masterPassword.trim()) {
            errors = ['Zadejte master heslo'];
            return;
        }

        loading = true;
        errors = [];

        try {
            await onConfirm(masterPassword);
            handleClose();
        } catch (err: any) {
            errors = [err.message || 'Nesprávné master heslo'];
        } finally {
            loading = false;
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter' && !loading) {
            event.preventDefault();
            handleSubmit();
        }
    }
</script>

<Modal {open} onClose={handleClose} title={title}>
    {#snippet children()}
        <div class="space-y-4">
            <p class="text-sm text-gray-500">
                {description}
            </p>

            <Input
                type="password"
                label="Master heslo"
                bind:value={masterPassword}
                onkeydown={handleKeydown}
                disabled={loading}
                autofocus
                placeholder="Zadejte své master heslo"
            />

            {#if errors.length > 0}
                <ErrorMessage message={errors[0]} />
            {/if}
        </div>
    {/snippet}

    {#snippet footer()}
        <div class="flex justify-end space-x-3">
            <Button 
                variant="secondary" 
                onclick={handleClose}
                disabled={loading}
            >
                Zrušit
            </Button>
            <Button 
                variant="primary" 
                onclick={handleSubmit}
                disabled={loading || !masterPassword.trim()}
                loading={loading}
            >
                Potvrdit
            </Button>
        </div>
    {/snippet}
</Modal>