<script lang="ts">
    import Button from '$lib/components/ui/Button.svelte';
    import type { PasswordCategory } from '$lib/services/api';

    interface Props {
        categories: PasswordCategory[];
        onEdit?: (id: string) => void;
    }

    let { categories = [], onEdit }: Props = $props();

    function formatDate(dateString?: string): string {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('cs-CZ');
    }

    function getColorName(hex?: string | null): string {
        if (!hex) return 'Šedá';
        
        const colorMap: Record<string, string> = {
            '#EF4444': 'Červená',
            '#F97316': 'Oranžová', 
            '#EAB308': 'Žlutá',
            '#22C55E': 'Zelená',
            '#3B82F6': 'Modrá',
            '#8B5CF6': 'Fialová',
            '#EC4899': 'Růžová',
            '#6B7280': 'Šedá'
        };
        
        return colorMap[hex] || hex;
    }
</script>

<div class="bg-white shadow overflow-hidden sm:rounded-md">
    {#if categories.length === 0}
        <div class="text-center py-12">
            <svg
                class="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Žádné kategorie</h3>
            <p class="mt-1 text-sm text-gray-500">Začněte přidáním první kategorie.</p>
        </div>
    {:else}
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th
                            scope="col"
                            class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        >
                            Název
                        </th>
                        <th
                            scope="col"
                            class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        >
                            Barva
                        </th>
                        <th
                            scope="col"
                            class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        >
                            Vytvořeno
                        </th>
                        <th scope="col" class="relative px-6 py-3">
                            <span class="sr-only">Akce</span>
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    {#each categories as category (category.id)}
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-gray-900">
                                    {category.name}
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center space-x-3">
                                    <div
                                        class="w-4 h-4 rounded-full border border-gray-300"
                                        style="background-color: {category.color_hex || '#6B7280'}"
                                    ></div>
                                    <span class="text-sm text-gray-900">
                                        {getColorName(category.color_hex)}
                                    </span>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(category.created_at)}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onclick={() => onEdit?.(category.id.toString())}
                                >
                                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                        />
                                    </svg>
                                </Button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>