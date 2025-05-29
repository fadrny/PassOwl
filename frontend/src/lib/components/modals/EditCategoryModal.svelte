<script lang="ts">
    import { CategoryManager } from '$lib/services/category-manager';
    import type { CategoryUpdateData } from '$lib/services/category-manager';
    import Modal from '$lib/components/ui/Modal.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Input from '$lib/components/ui/Input.svelte';
    import ErrorMessage from '$lib/components/ui/ErrorMessage.svelte';

    interface Props {
        open: boolean;
        onClose: () => void;
        categoryId?: number;
        initialData?: { name: string; color_hex: string };
        onCategoryUpdated?: () => void;
        onCategoryDeleted?: () => void;
    }

    let { open, onClose, categoryId, initialData, onCategoryUpdated, onCategoryDeleted }: Props = $props();

    let loading = $state(false);
    let deleting = $state(false);
    let errors: string[] = $state([]);

    let formData: CategoryUpdateData = $state({
        name: initialData?.name || '',
        color_hex: initialData?.color_hex || '#3B82F6'
    });

    // Přednastavené barvy
    const colors = [
        { name: 'Modrá', value: '#3B82F6' },
        { name: 'Zelená', value: '#22C55E' },
        { name: 'Červená', value: '#EF4444' },
        { name: 'Žlutá', value: '#EAB308' },
        { name: 'Fialová', value: '#8B5CF6' },
        { name: 'Růžová', value: '#EC4899' },
        { name: 'Oranžová', value: '#F97316' },
        { name: 'Šedá', value: '#6B7280' }
    ];

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

    function validateForm(): boolean {
        errors = [];

        if (!formData.name?.trim()) {
            errors.push('Název kategorie je povinný');
        }

        if (formData.name && formData.name.trim().length < 2) {
            errors.push('Název kategorie musí mít alespoň 2 znaky');
        }

        return errors.length === 0;
    }

    async function handleSubmit() {
        if (!categoryId || !validateForm()) return;

        loading = true;
        errors = [];

        try {
            const result = await CategoryManager.updateCategory(categoryId, formData);

            if (result.error) {
                errors = [result.error.detail];
                return;
            }

            onCategoryUpdated?.();
            handleClose();
        } catch (err) {
            console.error('Error updating category:', err);
            errors = ['Nastala neočekávaná chyba při aktualizaci kategorie'];
        } finally {
            loading = false;
        }
    }

    async function handleDelete() {
        if (!categoryId) return;

        const confirmed = confirm('Opravdu chcete smazat tuto kategorii? Tato akce je nevratná.');
        if (!confirmed) return;

        deleting = true;
        errors = [];

        try {
            const result = await CategoryManager.deleteCategory(categoryId);

            if (result.error) {
                errors = [result.error.detail];
                return;
            }

            onCategoryDeleted?.();
            handleClose();
        } catch (err) {
            console.error('Error deleting category:', err);
            errors = ['Nastala neočekávaná chyba při mazání kategorie'];
        } finally {
            deleting = false;
        }
    }
</script>

<Modal {open} onClose={handleClose} title="Upravit kategorii">
    {#snippet children()}
        <form class="space-y-4">
            <Input
                type="text"
                label="Název kategorie *"
                bind:value={formData.name}
                required
            />

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2" for="color-hex">
                    Barva kategorie
                </label>
                <div class="grid grid-cols-4 gap-3 color-hex">
                    {#each colors as color}
                        <button
                            type="button"
                            class="flex items-center space-x-2 p-2 rounded-md border transition-colors {formData.color_hex === color.value 
                                ? 'border-indigo-500 bg-indigo-50' 
                                : 'border-gray-300 hover:bg-gray-50'}"
                            onclick={() => formData.color_hex = color.value}
                        >
                            <div
                                class="w-4 h-4 rounded-full"
                                style="background-color: {color.value}"
                            ></div>
                            <span class="text-xs text-gray-700">{color.name}</span>
                        </button>
                    {/each}
                </div>
            </div>

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
                {deleting ? 'Mazání...' : 'Smazat kategorii'}
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