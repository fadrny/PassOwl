<script lang="ts">
    import { onMount } from 'svelte';
    import { CategoryManager } from '$lib/services/category-manager';
    import type { PasswordCategory } from '$lib/services/api';
    import CategoriesTable from '$lib/components/tables/CategoriesTable.svelte';
    import AddCategoryModal from '$lib/components/modals/AddCategoryModal.svelte';
    import EditCategoryModal from '$lib/components/modals/EditCategoryModal.svelte';
    import PageHeader from '$lib/components/layout/PageHeader.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import ErrorMessage from '$lib/components/ui/ErrorMessage.svelte';

    // State
    let categories: PasswordCategory[] = $state([]);
    let loading = $state(true);
    let error: string | null = $state(null);
    let showAddModal = $state(false);
    let showEditModal = $state(false);
    let editingCategoryId: number | undefined = $state(undefined);
    let editingCategoryData: { name: string; color_hex: string } | undefined = $state(undefined);

    // Načtení kategorií při načtení komponenty
    onMount(() => {
        loadCategories();
    });

    async function loadCategories() {
        loading = true;
        error = null;

        try {
            const result = await CategoryManager.getCategories();

            if (result.error) {
                error = result.error.detail;
                return;
            }

            categories = result.data || [];
        } catch (err) {
            console.error('Error loading categories:', err);
            error = 'Nepodařilo se načíst kategorie';
        } finally {
            loading = false;
        }
    }

    function handleEdit(id: string) {
        const categoryId = parseInt(id);
        const category = categories.find(c => c.id === categoryId);
        
        if (category) {
            editingCategoryId = categoryId;
            editingCategoryData = {
                name: category.name,
                color_hex: category.color_hex || '#6B7280'
            };
            showEditModal = true;
        }
    }

    function handleCategoryAdded() {
        loadCategories();
    }

    function handleCategoryUpdated() {
        loadCategories();
    }

    function handleCategoryDeleted() {
        loadCategories();
    }
</script>

<svelte:head>
    <title>Kategorie - PassOwl</title>
</svelte:head>

<div class="space-y-6">
    <PageHeader 
        title="Kategorie"
        description="Organizujte svá hesla do kategorií"
        buttonText="Přidat kategorii"
        onButtonClick={() => showAddModal = true}
    />

    {#if error}
        <ErrorMessage message={error} />
        <div class="flex justify-center">
            <Button variant="secondary" onclick={loadCategories}>
                Zkusit znovu
            </Button>
        </div>
    {:else if loading}
        <div class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    {:else}
        <CategoriesTable 
            categories={categories}
            onEdit={handleEdit}
        />
    {/if}
</div>

<!-- Modal pro přidání kategorie -->
<AddCategoryModal 
    open={showAddModal} 
    onClose={() => showAddModal = false}
    onCategoryAdded={handleCategoryAdded}
/>

<!-- Modal pro úpravu kategorie -->
<EditCategoryModal
    open={showEditModal}
    onClose={() => showEditModal = false}
    categoryId={editingCategoryId}
    initialData={editingCategoryData}
    onCategoryUpdated={handleCategoryUpdated}
    onCategoryDeleted={handleCategoryDeleted}
/>