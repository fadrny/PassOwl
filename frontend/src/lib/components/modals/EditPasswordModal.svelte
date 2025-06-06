<script lang="ts">
    import { PasswordManager } from '$lib/services/password-manager';
    import { SharingManager } from '$lib/services/sharing-manager';
    import type { PasswordUpdateData } from '$lib/services/password-manager';
    import type { SharedUserResponse } from '$lib/services/api';
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
    let sharedUsers: SharedUserResponse[] = $state([]);

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
            loadSharedUsers();
        }
    });

    async function loadSharedUsers() {
        if (!passwordId) return;

        try {
            const result = await SharingManager.getCredentialSharedUsers(passwordId);
            if (result.error) {
                console.error('Error loading shared users:', result.error);
                sharedUsers = [];
                return;
            }
            sharedUsers = result.data || [];
        } catch (err) {
            console.error('Error loading shared users:', err);
            sharedUsers = [];
        }
    }

    function handleClose() {
        errors = [];
        sharedUsers = [];
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
            // Zjistíme, jestli se změnilo heslo
            const passwordChanged = formData.password !== initialData?.password;
            
            const result = await PasswordManager.updatePassword(passwordId, formData);

            if (result.error) {
                errors = [result.error.detail];
                return;
            }

            // Pokud se změnilo heslo a existují sdílení, aktualizujeme je
            if (passwordChanged && sharedUsers.length > 0) {
                console.log(`Aktualizuji sdílení pro ${sharedUsers.length} uživatelů po změně hesla`);
                
                for (const sharedUser of sharedUsers) {
                    try {
                        await SharingManager.updateSharedPassword(passwordId, sharedUser.id);
                    } catch (sharingError) {
                        console.error(`Chyba při aktualizaci sdílení pro uživatele ${sharedUser.username}:`, sharingError);
                        // Pokračujeme i při chybě - nechceme blokovat celou aktualizaci
                    }
                }
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

        const confirmed = confirm('Opravdu chcete smazat toto heslo? Tato akce je nevratná a zruší se také všechna jeho sdílení.');
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

            {#if sharedUsers.length > 0}
                <div class="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <div class="flex">
                        <svg class="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div class="ml-3">
                            <h3 class="text-sm font-medium text-blue-800">Sdílené heslo</h3>
                            <div class="mt-1 text-sm text-blue-700">
                                <p>
                                    Toto heslo je sdíleno s {sharedUsers.length} 
                                    {#if sharedUsers.length === 1}
                                        uživatelem
                                    {:else if sharedUsers.length >= 2 && sharedUsers.length <= 4}
                                        uživateli
                                    {:else}
                                        uživateli
                                    {/if}
                                    ({sharedUsers.map(u => u.username).join(', ')}).
                                </p>
                                <p class="mt-1 font-medium">
                                    Při změně hesla se automaticky aktualizuje i sdílení.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            {/if}

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