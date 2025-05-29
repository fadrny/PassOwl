<script lang="ts">
    import { onMount } from 'svelte';
    import { PasswordManager } from '$lib/services/password-manager';
    import type { PageData } from './$types';
    import type { Credential } from '$lib/services/api';
    import type { DecryptedPassword } from '$lib/services/password-manager';
    import type { PasswordUpdateData } from '$lib/services/password-manager';
    import PasswordTable from '$lib/components/tables/PasswordTable.svelte';
    import AddPasswordModal from '$lib/components/modals/AddPasswordModal.svelte';
    import EditPasswordModal from '$lib/components/modals/EditPasswordModal.svelte';
    import PageHeader from '$lib/components/layout/PageHeader.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import ErrorMessage from '$lib/components/ui/ErrorMessage.svelte';

    let { data }: { data: PageData } = $props();

    // State
    let passwords: Credential[] = $state([]);
    let decryptedPasswords: Map<number, DecryptedPassword> = $state(new Map());
    let loading = $state(true);
    let error: string | null = $state(null);
    let showAddModal = $state(false);
    let showEditModal = $state(false);
    let editingPasswordId: number | undefined = $state(undefined);
    let editingPasswordData: PasswordUpdateData | undefined = $state(undefined);

    // Načtení hesel při načtení komponenty
    onMount(() => {
        loadPasswords();
    });

    async function loadPasswords() {
        loading = true;
        error = null;

        try {
            const result = await PasswordManager.getPasswords({ limit: 100 });

            if (result.error) {
                error = result.error.detail;
                return;
            }

            passwords = result.data || [];
        } catch (err) {
            console.error('Error loading passwords:', err);
            error = 'Nepodařilo se načíst hesla';
        } finally {
            loading = false;
        }
    }

    // Transformace pro PasswordTable komponentu - použití $derived
    const transformedPasswords = $derived(passwords.map(password => {
        const decrypted = decryptedPasswords.get(password.id);
        return {
            id: password.id.toString(),
            name: password.title,                    // plaintext z API
            username: password.username,             // plaintext z API
            encryptedPassword: password.encrypted_data,
            decryptedPassword: decrypted?.password,  // dešifrované heslo
            url: password.url,                       // plaintext z API
            category: password.categories?.[0] ? {
                id: password.categories[0].id.toString(),
                name: password.categories[0].name,
                color: password.categories[0].color_hex || 'gray'
            } : undefined,
            created_at: password.created_at,
            updated_at: password.updated_at
        };
    }));

    async function handleDecrypt(id: string) {
        const passwordId = parseInt(id);
        const password = passwords.find(p => p.id === passwordId);
        
        if (!password) return;

        // Pokud je už dešifrováno, skryj ho
        if (decryptedPasswords.has(passwordId)) {
            decryptedPasswords.delete(passwordId);
            decryptedPasswords = new Map(decryptedPasswords);
            return;
        }

        try {
            const result = await PasswordManager.decryptPassword(password);
            
            if (result.error) {
                alert(`Chyba při dešifrování: ${result.error.detail}`);
                return;
            }

            if (result.data) {
                decryptedPasswords.set(passwordId, result.data);
                decryptedPasswords = new Map(decryptedPasswords);
            }
        } catch (err) {
            console.error('Error decrypting password:', err);
            alert('Nepodařilo se dešifrovat heslo');
        }
    }

    function handleEdit(id: string) {
        const passwordId = parseInt(id);
        const password = passwords.find(p => p.id === passwordId);
        
        if (password) {
            editingPasswordId = passwordId;
            editingPasswordData = {
                title: password.title,
                username: password.username,
                password: '', // Bude potřeba dešifrovat - uživatel může změnit
                url: password.url,
                categoryIds: password.categories?.map(c => c.id) || []
            };
            showEditModal = true;
        }
    }

    function handleShare(id: string) {
        console.log('Share password:', id);
        // TODO: Implementovat sdílení hesla
    }

    function handlePasswordAdded() {
        // Znovu načíst hesla po přidání nového
        loadPasswords();
    }
</script>

<svelte:head>
    <title>Hesla - PassOwl</title>
</svelte:head>

<div class="space-y-6">
    <PageHeader 
        title="Hesla"
        description="Spravujte svá hesla bezpečně a na jednom místě."
        buttonText="Přidat nové heslo"
        onButtonClick={() => showAddModal = true}
    />

    {#if error}
        <ErrorMessage message={error} />
        <div class="flex justify-center">
            <Button variant="secondary" onclick={loadPasswords}>
                Zkusit znovu
            </Button>
        </div>
    {:else if loading}
        <div class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    {:else}
        <PasswordTable 
            passwords={transformedPasswords}
            onDecrypt={handleDecrypt}
            onEdit={handleEdit}
            onShare={handleShare}
        />
    {/if}
</div>

<!-- Modal pro přidání hesla -->
<AddPasswordModal 
    open={showAddModal} 
    onClose={() => showAddModal = false}
    onPasswordAdded={handlePasswordAdded}
/>

<EditPasswordModal
    open={showEditModal}
    onClose={() => showEditModal = false}
    passwordId={editingPasswordId}
    initialData={editingPasswordData}
    onPasswordUpdated={loadPasswords}
    onPasswordDeleted={loadPasswords}
/>

