<script lang="ts">
    import { onMount } from 'svelte';
    import { CategoryManager } from '$lib/services/category-manager';
    import { getSafeColor } from '$lib/config/category-colors';
    import type { PasswordCategory } from '$lib/services/api';

    interface Props {
        selectedIds?: number[];
        onSelectionChange?: (selectedIds: number[]) => void;
        disabled?: boolean;
    }

    let { selectedIds = [], onSelectionChange, disabled = false }: Props = $props();

    let categories: PasswordCategory[] = $state([]);
    let loading = $state(true);
    let error: string | null = $state(null);

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

    function toggleCategory(categoryId: number) {
        if (disabled) return;

        const newSelectedIds = selectedIds.includes(categoryId)
            ? selectedIds.filter(id => id !== categoryId)
            : [...selectedIds, categoryId];

        onSelectionChange?.(newSelectedIds);
    }

    function isSelected(categoryId: number): boolean {
        return selectedIds.includes(categoryId);
    }
</script>

<div class="space-y-2">
    <label class="block text-sm font-medium text-gray-700" for="category-select">
        Kategorie
    </label>

    {#if loading}
        <div class="flex items-center space-x-2 text-sm text-gray-500">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
            <span>Načítání kategorií...</span>
        </div>
    {:else if error}
        <div class="text-sm text-red-600">
            {error}
        </div>
    {:else if categories.length === 0}
        <div class="text-sm text-gray-500">
            Žádné kategorie nejsou k dispozici. 
            <a href="/dashboard/categories" class="text-indigo-600 hover:text-indigo-500">
                Vytvořte první kategorii
            </a>
        </div>
    {:else}
        <div class="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto" id="category-select">
            {#each categories as category (category.id)}
                <button
                    type="button"
                    class="flex items-center space-x-2 p-2 rounded-md border text-left transition-colors {isSelected(category.id)
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-300 hover:bg-gray-50 text-gray-700'} {disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}"
                    onclick={() => toggleCategory(category.id)}
                    disabled={disabled}
                >
                    <div
                        class="w-3 h-3 rounded-full flex-shrink-0"
                        style="background-color: {getSafeColor(category.color_hex)}"
                    ></div>
                    <span class="text-sm truncate">{category.name}</span>
                    {#if isSelected(category.id)}
                        <svg class="w-4 h-4 ml-auto flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fill-rule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clip-rule="evenodd"
                            />
                        </svg>
                    {/if}
                </button>
            {/each}
        </div>
    {/if}
</div>