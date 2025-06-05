<script lang="ts">
    import Button from '$lib/components/ui/Button.svelte';
    import type { PasswordCategory } from '$lib/services/api';

    interface PasswordEntry {
        id: string;
        name: string;
        username: string;
        encryptedPassword: string;
        decryptedPassword?: string;
        url?: string | null;
        category?: {
            id: string;
            name: string;
            color: string;
        };
        created_at?: string;
        updated_at?: string;
    }

    interface Props {
        passwords: PasswordEntry[];
        categories?: PasswordCategory[];
        onDecrypt?: (id: string) => void;
        onEdit?: (id: string) => void;
        onShare?: (id: string) => void;
        onSortChange?: (sortBy: string, direction: string) => void;
        onCategoryFilter?: (categoryId: number | null) => void;
        currentSort?: { by: string; direction: string };
        currentCategoryFilter?: number | null;
    }

    let { 
        passwords = [], 
        categories = [],
        onDecrypt, 
        onEdit, 
        onShare,
        onSortChange,
        onCategoryFilter,
        currentSort = { by: '', direction: 'asc' },
        currentCategoryFilter = null
    }: Props = $props();

    // Stav pro sledování, které heslo je dešifrované
    const decryptedPasswordIds = $derived(
        new Set(
            passwords
                .filter(p => p.decryptedPassword !== undefined)
                .map(p => p.id)
        )
    );

    function handleSort(sortBy: string) {
        const newDirection = currentSort.by === sortBy && currentSort.direction === 'asc' ? 'desc' : 'asc';
        onSortChange?.(sortBy, newDirection);
    }

    function handleCategoryFilter(event: Event) {
        const target = event.target as HTMLSelectElement;
        const categoryId = target.value ? parseInt(target.value) : null;
        onCategoryFilter?.(categoryId);
    }

    function handleDecrypt(id: string) {
        onDecrypt?.(id);
    }

    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Zkopírováno do schránky');
        }).catch(err => {
            console.error('Chyba při kopírování:', err);
        });
    }

    function formatDate(dateString?: string): string {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('cs-CZ');
    }

    function getSortIcon(column: string) {
        if (currentSort.by !== column) {
            return '↕'; // Neutrální ikona
        }
        return currentSort.direction === 'asc' ? '↑' : '↓';
    }
</script>

<div class="bg-white shadow overflow-hidden sm:rounded-md">
    <!-- Ovládací panel pro filtrování a řazení -->
    <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">
                Hesla ({passwords.length})
            </h3>
            
            <div class="flex flex-col sm:flex-row gap-3">
                <!-- Filtr podle kategorie -->
                <div class="flex items-center gap-2">
                    <label for="category-filter" class="text-sm font-medium text-gray-700">
                        Kategorie:
                    </label>
                    <select 
                        id="category-filter"
                        class="block w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        onchange={handleCategoryFilter}
                        value={currentCategoryFilter || ''}
                    >
                        <option value="">Všechny kategorie</option>
                        {#each categories as category}
                            <option value={category.id}>{category.name}</option>
                        {/each}
                    </select>
                </div>

                <!-- Info o aktuálním řazení -->
                {#if currentSort.by}
                    <div class="flex items-center gap-2 text-sm text-gray-600">
                        <span>Řazeno podle:</span>
                        <span class="font-medium">
                            {currentSort.by === 'title' ? 'Názvu' : 'Data vytvoření'}
                            ({currentSort.direction === 'asc' ? 'vzestupně' : 'sestupně'})
                        </span>
                    </div>
                {/if}
            </div>
        </div>
    </div>

    {#if passwords.length === 0}
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">
                {currentCategoryFilter ? 'Žádná hesla v této kategorii' : 'Žádná hesla'}
            </h3>
            <p class="mt-1 text-sm text-gray-500">
                {currentCategoryFilter ? 'Zkuste vybrat jinou kategorii nebo přidat nové heslo.' : 'Začněte přidáním prvního hesla.'}
            </p>
        </div>
    {:else}
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th
                            scope="col"
                            class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:bg-gray-100"
                            onclick={() => handleSort('title')}
                        >
                            <div class="flex items-center gap-1">
                                Název
                                <span class="text-gray-400">{getSortIcon('title')}</span>
                            </div>
                        </th>
                        <th
                            scope="col"
                            class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        >
                            Uživatelské jméno
                        </th>
                        <th
                            scope="col"
                            class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        >
                            Heslo
                        </th>
                        <th
                            scope="col"
                            class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        >
                            Kategorie
                        </th>
                        <th
                            scope="col"
                            class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer hover:bg-gray-100"
                            onclick={() => handleSort('created_at')}
                        >
                            <div class="flex items-center gap-1">
                                Vytvořeno
                                <span class="text-gray-400">{getSortIcon('created_at')}</span>
                            </div>
                        </th>
                        <th scope="col" class="relative px-6 py-3">
                            <span class="sr-only">Akce</span>
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    {#each passwords as password (password.id)}
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <div class="text-sm font-medium text-gray-900">
                                        {password.name}
                                    </div>
                                    {#if password.url}
                                        <a href={password.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            class="ml-2 text-indigo-600 hover:text-indigo-500"
                                            title="Otevřít URL"
                                            aria-label="Odkaz na web"
                                        >
                                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    stroke-width="2"
                                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M14 4h6m0 0v6m0-6L10 14"
                                                />
                                            </svg>
                                        </a>
                                    {/if}
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <span class="text-sm text-gray-900">{password.username}</span>
                                    <button
                                        onclick={() => copyToClipboard(password.username)}
                                        class="ml-2 p-1 text-gray-400 hover:text-gray-600"
                                        title="Kopírovat uživatelské jméno"
                                        aria-label="Kopírovat uživatelské jméno"
                                    >
                                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    {#if decryptedPasswordIds.has(password.id)}
                                        <span class="text-sm text-gray-900 font-mono mr-2">
                                            {password.decryptedPassword}
                                        </span>
                                        <button
                                            onclick={() => copyToClipboard(password.decryptedPassword || '')}
                                            class="p-1 text-gray-400 hover:text-gray-600 mr-2"
                                            title="Kopírovat heslo"
                                            aria-label="Kopírovat heslo"
                                        >
                                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    stroke-width="2"
                                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                                />
                                            </svg>
                                        </button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onclick={() => handleDecrypt(password.id)}
                                        >
                                            Skrýt
                                        </Button>
                                    {:else}
                                        <span class="text-sm text-gray-400 mr-2">••••••••</span>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onclick={() => handleDecrypt(password.id)}
                                        >
                                            Zobrazit
                                        </Button>
                                    {/if}
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                {#if password.category}
                                    <span
                                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                                        style="background-color: {password.category.color}"
                                    >
                                        {password.category.name}
                                    </span>
                                {:else}
                                    <span class="text-sm text-gray-400">Bez kategorie</span>
                                {/if}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(password.created_at)}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div class="flex items-center gap-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onclick={() => onEdit?.(password.id)}
                                    >
                                        Upravit
                                    </Button>
                                    {#if onShare}
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onclick={() => onShare?.(password.id)}
                                        >
                                            Sdílet
                                        </Button>
                                    {/if}
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>
