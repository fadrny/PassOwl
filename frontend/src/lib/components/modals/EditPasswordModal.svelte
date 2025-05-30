<script lang="ts">
    import { PasswordManager } from '$lib/services/password-manager';
    import type { PasswordUpdateData } from '$lib/services/password-manager';
    import Modal from '$lib/components/modals/Modal.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Input from '$lib/components/ui/Input.svelte';
    import ErrorMessage from '$lib/components/ui/ErrorMessage.svelte';
    import CategorySelect from '$lib/components/ui/CategorySelect.svelte';

    interface Props {
        open: boolean;
        onClose: () => void;
        passwordId?: number;
        initialData?: PasswordUpdateData;
        onPasswordUpdated?: () => void;
        onPasswordDeleted?: () => void;
    }

    let { open, onClose, passwordId, initialData, onPasswordUpdated, onPasswordDeleted }: Props = $props();

    let loading = $state(false);
    let deleting = $state(false);
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

    function handleCategoryChange(selectedIds: number[]) {
        formData.categoryIds = selectedIds;
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

    async function handleDelete() {
        if (!passwordId) return;

        const confirmed = confirm('Opravdu chcete smazat toto heslo? Tato akce je nevratná.');
        if (!confirmed) return;

        deleting = true;
        errors = [];

        try {
            const result = await PasswordManager.deletePassword(passwordId);

            if (result.error) {
                errors = [result.error.detail];
                return;
            }

            onPasswordDeleted?.();
            handleClose();
        } catch (err) {
            console.error('Error deleting password:', err);
            errors = ['Nastala neočekávaná chyba při mazání hesla'];
        } finally {
            deleting = false;
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

            <CategorySelect
                selectedIds={formData.categoryIds || []}
                onSelectionChange={handleCategoryChange}
                disabled={loading || deleting}
            />

            {#if errors.length > 0}
                <ErrorMessage message={errors[0]} />
            {/if}
        </form>
    {/snippet}

    {#snippet footer()}
        <div class="flex justify-between">
            <Button 
                variant="danger" 
                onclick={handleDelete} 
                disabled={loading || deleting}
                loading={deleting}
            >
                {deleting ? 'Mazání...' : 'Smazat heslo'}
            </Button>
            <div class="flex space-x-3">
                <Button variant="secondary" onclick={handleClose} disabled={loading || deleting}>
                    Zrušit
                </Button>
                <Button variant="primary" onclick={handleSubmit} disabled={loading || deleting} loading={loading}>
                    {loading ? 'Ukládání...' : 'Uložit změny'}
                </Button>
            </div>
        </div>
    {/snippet}
</Modal>