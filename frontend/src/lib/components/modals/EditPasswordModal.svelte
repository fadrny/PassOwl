<script lang="ts">
    import { PasswordManager } from '$lib/services/password-manager';
    import type { PasswordUpdateData } from '$lib/services/password-manager';
    import Modal from '$lib/components/ui/Modal.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Input from '$lib/components/ui/Input.svelte';
    import ErrorMessage from '$lib/components/ui/ErrorMessage.svelte';

    interface Props {
        open: boolean;
        onClose: () => void;
        passwordId?: number;
        initialData?: PasswordUpdateData;
        onPasswordUpdated?: () => void;
    }

    let { open, onClose, passwordId, initialData, onPasswordUpdated }: Props = $props();

    let loading = $state(false);
    let errors: string[] = $state([]);

    let formData: PasswordUpdateData = $state({
        title: initialData?.title || '',
        username: initialData?.username || '',
        password: initialData?.password || '',
        url: initialData?.url || '',
        categoryIds: initialData?.categoryIds || []
    });

    // Reset form when modal opens with new data
    $effect(() => {
        if (open && initialData) {
            formData = { ...initialData };
        }
    });

    function handleClose() {
        errors = [];
        onClose();
    }

    async function handleSubmit() {
        if (!passwordId) return;

        loading = true;
        errors = [];

        try {
            const result = await PasswordManager.updatePassword(passwordId, formData);

            if (result.error) {
                errors = [result.error.detail];
                return;
            }

            onPasswordUpdated?.();
            handleClose();
        } catch (err) {
            console.error('Error updating password:', err);
            errors = ['Nastala neočekávaná chyba při aktualizaci hesla'];
        } finally {
            loading = false;
        }
    }
</script>

<Modal {open} onClose={handleClose} title="Upravit heslo">
    {#snippet children()}
        <form class="space-y-4">
            <Input
                type="text"
                label="Název *"
                bind:value={formData.title}
                required
            />

            <Input
                type="text"
                label="Uživatelské jméno *"
                bind:value={formData.username}
                required
            />

            <Input
                type="password"
                label="Heslo *"
                bind:value={formData.password}
                required
            />

            <Input
                type="url"
                label="URL"
                bind:value={formData.url}
            />

            {#if errors.length > 0}
                <ErrorMessage message={errors[0]} />
            {/if}
        </form>
    {/snippet}

    {#snippet footer()}
        <div class="flex justify-end space-x-3">
            <Button variant="secondary" onclick={handleClose} disabled={loading}>
                Zrušit
            </Button>
            <Button variant="primary" onclick={handleSubmit} disabled={loading} loading={loading}>
                {loading ? 'Ukládání...' : 'Uložit změny'}
            </Button>
        </div>
    {/snippet}
</Modal>