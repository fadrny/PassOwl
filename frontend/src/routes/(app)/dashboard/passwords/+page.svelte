<script lang="ts">
    import { onMount } from 'svelte';
    import { PasswordManager, type PasswordUpdateData } from '$lib/services/password-manager';
    import { CategoryManager } from '$lib/services/category-manager';
    import type { Credential, PasswordCategory } from '$lib/services/api';
    import PasswordTable from '$lib/components/tables/PasswordTable.svelte';
    import SharedPasswordTable from '$lib/components/tables/SharedPasswordTable.svelte';
    import PageHeader from '$lib/components/layout/PageHeader.svelte';
    import ErrorMessage from '$lib/components/ui/ErrorMessage.svelte';
    import AddPasswordModal from '$lib/components/modals/AddPasswordModal.svelte';
    import EditPasswordModal from '$lib/components/modals/EditPasswordModal.svelte';
    import SharePasswordModal from '$lib/components/modals/SharePasswordModal.svelte';
    import { SharingManager } from '$lib/services/sharing-manager';
    import type { SharedCredentialResponse, DecryptedSharedPassword } from '$lib/services/sharing-manager';

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

    // Nový stav pro sdílení
    let sharedPasswords: SharedCredentialResponse[] = $state([]);
    let decryptedSharedPasswords = $state(new Map<number, DecryptedSharedPassword>());
    let showShareModal = $state(false);
    let sharePasswordId = $state(0);
    let sharePasswordTitle = $state('');

    // Načtení hesel při načtení komponenty
    onMount(async () => {
        await loadPasswords();
        await loadCategories();
        await loadSharedPasswords();
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

    async function loadSharedPasswords() {
        try {
            const result = await SharingManager.getSharedPasswords();
            if (result.error) {
                console.error('Error loading shared passwords:', result.error);
                return;
            }
            sharedPasswords = result.data || [];
        } catch (err) {
            console.error('Error loading shared passwords:', err);
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

    // ZJEDNODUŠENÁ FUNKCE PRO SDÍLENÁ HESLA
    async function handleDecryptShared(sharedId: number) {
        const sharedCredential = sharedPasswords.find(sp => sp.id === sharedId);
        if (!sharedCredential) return;

        // Pokud je už dešifrováno, skryj ho
        if (decryptedSharedPasswords.has(sharedId)) {
            decryptedSharedPasswords.delete(sharedId);
            decryptedSharedPasswords = new Map(decryptedSharedPasswords);
            return;
        }

        try {
            const result = await SharingManager.decryptSharedPassword(sharedCredential);
            
            if (result.error) {
                alert(`Chyba při dešifrování: ${result.error.detail}`);
                return;
            }

            if (result.data) {
                decryptedSharedPasswords.set(sharedId, result.data);
                decryptedSharedPasswords = new Map(decryptedSharedPasswords);
            }
        } catch (err) {
            console.error('Error decrypting shared password:', err);
            alert('Nepodařilo se dešifrovat sdílené heslo');
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
        const passwordId = parseInt(id);
        const password = passwords.find(p => p.id === passwordId);
        
        if (password) {
            sharePasswordId = passwordId;
            sharePasswordTitle = password.title;
            showShareModal = true;
        }
    }

    function handlePasswordAdded() {
        // Znovu načíst hesla po přidání nového
        loadPasswords();
        showAddModal = false;
    }

    function handlePasswordUpdated() {
        loadPasswords();
        showEditModal = false;
    }

    function handlePasswordDeleted() {
        loadPasswords();
        showEditModal = false;
    }

    function handlePasswordShared() {
        showShareModal = false;
        loadSharedPasswords(); // Načíst znovu sdílená hesla
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
    {/if}

    <!-- Vlastní hesla -->
    <PasswordTable 
        passwords={transformedPasswords}
        categories={categories}
        loading={loading}
        onDecrypt={handleDecrypt}
        onEdit={handleEdit}
        onShare={handleShare}
        onSortChange={handleSortChange}
        onCategoryFilter={handleCategoryFilter}
        currentSort={currentSort}
        currentCategoryFilter={currentCategoryFilter}
    />

    <!-- Sdílená hesla -->
    <SharedPasswordTable
        sharedPasswords={sharedPasswords}
        decryptedSharedPasswords={decryptedSharedPasswords}
        onDecrypt={handleDecryptShared}
    />
</div>

<!-- Modály -->
<AddPasswordModal
    open={showAddModal}
    onClose={() => showAddModal = false}
    categories={categories}
    onPasswordAdded={handlePasswordAdded}
/>

<EditPasswordModal
    open={showEditModal}
    onClose={() => showEditModal = false}
    passwordId={editingPasswordId}
    initialData={editingPasswordData}
    categories={categories}
    onPasswordUpdated={handlePasswordUpdated}
    onPasswordDeleted={handlePasswordDeleted}
/>

<SharePasswordModal
    open={showShareModal}
    onClose={() => showShareModal = false}
    passwordId={sharePasswordId}
    passwordTitle={sharePasswordTitle}
    onShared={handlePasswordShared}
/>

