<script lang="ts">
    import { CategoryManager } from '$lib/services/category-manager';
    import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from '$lib/config/category-colors';
    import type { CategoryCreateData } from '$lib/services/category-manager';
    import Modal from '$lib/components/modals/Modal.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Input from '$lib/components/ui/Input.svelte';
    import ErrorMessage from '$lib/components/ui/ErrorMessage.svelte';

    interface Props {
        open: boolean;
        onClose: () => void;
        onCategoryAdded?: () => void;
    }

    let { open, onClose, onCategoryAdded }: Props = $props();

    let loading = $state(false);
    let errors: string[] = $state([]);

    let formData: CategoryCreateData = $state({
        name: '',
        color_hex: DEFAULT_CATEGORY_COLOR
    });

    // Reset formuláře při otevření modalu
    $effect(() => {
        if (open) {
            formData = {
                name: '',
                color_hex: DEFAULT_CATEGORY_COLOR
            };
            errors = [];
        }
    });

    function handleClose() {
        errors = [];
        onClose();
    }

    function validateForm(): boolean {
        errors = [];

        if (!formData.name.trim()) {
            errors.push('Název kategorie je povinný');
        }

        if (formData.name.trim().length < 2) {
            errors.push('Název kategorie musí mít alespoň 2 znaky');
        }

        return errors.length === 0;
    }

    async function handleSubmit() {
        if (!validateForm()) return;

        loading = true;
        errors = [];

        try {
            const result = await CategoryManager.createCategory(formData);

            if (result.error) {
                errors = [result.error.detail];
                return;
            }

            onCategoryAdded?.();
            handleClose();
        } catch (err) {
            console.error('Error creating category:', err);
            errors = ['Nastala neočekávaná chyba při vytváření kategorie'];
        } finally {
            loading = false;
        }
    }
</script>

<Modal {open} onClose={handleClose} title="Přidat kategorii">
    {#snippet children()}
        <form
            class="space-y-4"
            onsubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }}
        >
            <Input
                type="text"
                name="name"
                id="name"
                label="Název kategorie *"
                placeholder="např. Sociální sítě, Práce..."
                required
                bind:value={formData.name}
            />

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2" for="color-select">
                    Barva kategorie
                </label>
                <div class="grid grid-cols-5 gap-3" id="color-select">
                    {#each CATEGORY_COLORS as color}
                        <button
                            type="button"
                            class="flex flex-col items-center p-2 rounded-md border transition-colors {formData.color_hex === color.value 
                                ? 'border-indigo-500 bg-indigo-50' 
                                : 'border-gray-300 hover:bg-gray-50'}"
                            onclick={() => formData.color_hex = color.value}
                        >
                            <div
                                class="w-6 h-6 rounded-full mb-1"
                                style="background-color: {color.value}"
                            ></div>
                            <span class="text-xs text-gray-700 text-center">{color.name}</span>
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
        <div class="flex space-x-3">
            <Button variant="secondary" onclick={handleClose} disabled={loading}>
                Zrušit
            </Button>
            <Button variant="primary" onclick={handleSubmit} disabled={loading} loading={loading}>
                {loading ? 'Vytváření...' : 'Vytvořit kategorii'}
            </Button>
        </div>
    {/snippet}
</Modal>