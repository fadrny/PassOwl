<script lang="ts">
    import { onMount } from 'svelte';
    import { PasswordManager, type PasswordUpdateData } from '$lib/services/password-manager';
    import { CategoryManager } from '$lib/services/category-manager';
    import type { Credential, PasswordCategory } from '$lib/services/api';
    import PasswordTable from '$lib/components/tables/PasswordTable.svelte';
    import PageHeader from '$lib/components/layout/PageHeader.svelte';
    import ErrorMessage from '$lib/components/ui/ErrorMessage.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import AddPasswordModal from '$lib/components/modals/AddPasswordModal.svelte';
    import EditPasswordModal from '$lib/components/modals/EditPasswordModal.svelte';

    let passwords: Credential[] = $state([]);
    let categories: PasswordCategory[] = $state([]);
    let decryptedPasswords = $state(new Map<number, any>());
    let loading = $state(true);
    let error: string | null = $state(null);
    let showAddModal = $state(false);
    let showEditModal = $state(false);
    let editingPasswordId: number | undefined = $state(undefined);
    let editingPasswordData: PasswordUpdateData | undefined = $state(undefined);

    // Nové stavy pro filtrování a řazení
    let currentSort = $state({ by: '', direction: 'asc' });
    let currentCategoryFilter: number | null = $state(null);

    // Načtení hesel při načtení komponenty
    onMount(() => {
        loadCategories();
        loadPasswords();
    });

    async function loadCategories() {
        try {
            const result = await CategoryManager.getCategories();
            if (result.data) {
                categories = result.data;
            }
        } catch (err) {
            console.error('Error loading categories:', err);
        }
    }

    async function loadPasswords() {
        loading = true;
        error = null;

        try {
            const params: any = { limit: 100 };
            
            // Přidání parametrů řazení
            if (currentSort.by) {
                params.sort_by = currentSort.by;
                params.sort_direction = currentSort.direction;
            }
            
            // Přidání filtru kategorie
            if (currentCategoryFilter !== null) {
                params.filter_category = currentCategoryFilter;
            }

            const result = await PasswordManager.getPasswords(params);

            if (result.error) {
                error = result.error.detail;
                return;
            }

            passwords = result.data || [];
            // Vyčistit dešifrovaná hesla při novém načtení
            decryptedPasswords.clear();
            decryptedPasswords = new Map(decryptedPasswords);
        } catch (err) {
            console.error('Error loading passwords:', err);
            error = 'Nepodařilo se načíst hesla';
        } finally {
            loading = false;
        }
    }

    // Transformace pro PasswordTable komponentu
    const transformedPasswords = $derived(
        passwords.map(password => {
            const decrypted = decryptedPasswords.get(password.id);
            return {
                id: password.id.toString(),
                name: password.title,
                username: password.username,
                encryptedPassword: password.encrypted_data,
                decryptedPassword: decrypted?.password,
                url: password.url,
                category: password.categories?.[0] ? {
                    id: password.categories[0].id.toString(),
                    name: password.categories[0].name,
                    color: password.categories[0].color_hex || '#6B7280'
                } : undefined,
                created_at: password.created_at,
                updated_at: password.updated_at
            };
        })
    );

    async function handleDecrypt(passwordId: string) {
        const id = parseInt(passwordId);
        const password = passwords.find(p => p.id === id);
        
        if (!password) return;

        // Pokud je už dešifrováno, skryj ho
        if (decryptedPasswords.has(id)) {
            decryptedPasswords.delete(id);
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
                decryptedPasswords.set(id, result.data);
                decryptedPasswords = new Map(decryptedPasswords);
            }
        } catch (err) {
            console.error('Error decrypting password:', err);
            alert('Nepodařilo se dešifrovat heslo');
        }
    }

    function handleSortChange(sortBy: string, direction: string) {
        currentSort = { by: sortBy, direction };
        loadPasswords();
    }

    function handleCategoryFilter(categoryId: number | null) {
        currentCategoryFilter = categoryId;
        loadPasswords();
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
            categories={categories}
            onDecrypt={handleDecrypt}
            onEdit={handleEdit}
            onShare={handleShare}
            onSortChange={handleSortChange}
            onCategoryFilter={handleCategoryFilter}
            currentSort={currentSort}
            currentCategoryFilter={currentCategoryFilter}
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
/>

