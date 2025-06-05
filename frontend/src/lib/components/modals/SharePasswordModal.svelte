<script lang="ts">
    import Modal from './Modal.svelte';
    import Button from '../ui/Button.svelte';
    import Input from '../ui/Input.svelte';
    import ErrorMessage from '../ui/ErrorMessage.svelte';
    import { SharingManager } from '$lib/services/sharing-manager';
    
    interface Props {
        open: boolean;
        onClose: () => void;
        passwordId: number;
        passwordTitle: string;
        onShared?: () => void;
    }

    let { open, onClose, passwordId, passwordTitle, onShared }: Props = $props();

    let searchQuery = $state('');
    let selectedUser: { id: number; username: string } | null = $state(null);
    let searchResults: Array<{ id: number; username: string }> = $state([]);
    let loading = $state(false);
    let searchLoading = $state(false);
    let errors: string[] = $state([]);
    let searchTimeout: ReturnType<typeof setTimeout>;

    // Debounced search
    $effect(() => {
        if (searchQuery.length >= 2) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(async () => {
                await searchUsers();
            }, 300);
        } else {
            searchResults = [];
        }
    });

    function resetForm() {
        searchQuery = '';
        selectedUser = null;
        searchResults = [];
        loading = false;
        searchLoading = false;
        errors = [];
    }

    function handleClose() {
        resetForm();
        onClose();
    }

    async function searchUsers() {
        if (searchQuery.length < 2) return;

        searchLoading = true;
        try {
            const result = await SharingManager.searchUsers(searchQuery);
            if (result.error) {
                errors = [result.error.detail];
                return;
            }
            searchResults = result.data || [];
        } catch (err) {
            console.error('Error searching users:', err);
            errors = ['Chyba při vyhledávání uživatelů'];
        } finally {
            searchLoading = false;
        }
    }

    function selectUser(user: { id: number; username: string }) {
        selectedUser = user;
        searchQuery = user.username;
        searchResults = [];
    }

    async function handleSubmit() {
        if (!selectedUser) {
            errors = ['Vyberte uživatele pro sdílení'];
            return;
        }

        loading = true;
        errors = [];

        try {
            const result = await SharingManager.sharePassword({
                credentialId: passwordId,
                recipientUserId: selectedUser.id
            });

            if (result.error) {
                errors = [result.error.detail];
                return;
            }

            onShared?.();
            handleClose();
        } catch (err) {
            console.error('Error sharing password:', err);
            errors = ['Nepodařilo se sdílet heslo'];
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

<Modal {open} onClose={handleClose} title="Sdílet heslo">
    {#snippet children()}
        <div class="space-y-4">
            <p class="text-sm text-gray-500">
                Sdílet heslo "{passwordTitle}" s jiným uživatelem
            </p>

            <div class="relative">
                <Input
                    type="text"
                    label="Vyhledat uživatele"
                    bind:value={searchQuery}
                    onkeydown={handleKeydown}
                    disabled={loading}
                    placeholder="Začněte psát jméno uživatele..."
                />
                
                {#if searchLoading}
                    <div class="absolute right-3 top-9">
                        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                {/if}

                <!-- Search results dropdown -->
                {#if searchResults.length > 0}
                    <div class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                        {#each searchResults as user}
                            <button
                                type="button"
                                class="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onclick={() => selectUser(user)}
                            >
                                {user.username}
                            </button>
                        {/each}
                    </div>
                {/if}
            </div>

            {#if selectedUser}
                <div class="bg-blue-50 p-3 rounded-md">
                    <p class="text-sm text-blue-800">
                        <strong>Vybraný uživatel:</strong> {selectedUser.username}
                    </p>
                </div>
            {/if}

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
                disabled={loading || !selectedUser}
                loading={loading}
            >
                Sdílet heslo
            </Button>
        </div>
    {/snippet}
</Modal>