<script lang="ts">
    import Button from '../ui/Button.svelte';
    import type { SharedCredentialResponse } from '$lib/services/api';
    import type { DecryptedSharedPassword } from '$lib/services/sharing-manager';
    import MdLink from 'svelte-icons/md/MdLink.svelte'

    interface Props {
        sharedPasswords: SharedCredentialResponse[];
        decryptedSharedPasswords: Map<number, DecryptedSharedPassword>;
        currentPage: number;
        totalPages: number;
        totalCount: number;
        loading: boolean;
        onDecrypt?: (id: number) => void;
        onPageChange?: (page: number) => void;
    }

    let { 
        sharedPasswords, 
        decryptedSharedPasswords,
        currentPage,
        totalPages,
        totalCount,
        loading,
        onDecrypt,
        onPageChange
    }: Props = $props();

    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Zkopírováno do schránky');
        }).catch(err => {
            console.error('Chyba při kopírování:', err);
        });
    }

    function formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString('cs-CZ');
    }

    function openUrl(url: string) {
        window.open(url, '_blank', 'noopener,noreferrer');
    }

    // Stav pro sledování, které heslo je dešifrované
    const decryptedPasswordIds = $derived(
        new Set(Array.from(decryptedSharedPasswords.keys()))
    );

    // Pagination helpers
    function handlePageChange(page: number) {
        if (page >= 1 && page <= totalPages) {
            onPageChange?.(page);
        }
    }

</script>

<div class="bg-white shadow overflow-hidden sm:rounded-md">
    <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div class="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
            <div>
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                    Sdílená hesla ({totalCount})
                </h3>
            </div>
        </div>
    </div>

    {#if loading}
        <div class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    {:else if sharedPasswords.length === 0}
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
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Žádná sdílená hesla</h3>
            <p class="mt-1 text-sm text-gray-500">
                Zatím s vámi nikdo nesdílel žádná hesla.
            </p>
        </div>
    {:else}
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Název
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Uživatelské jméno
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Heslo
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vlastník
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sdíleno
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    {#each sharedPasswords as sharedPassword (sharedPassword.id)}
                        {@const isDecrypted = decryptedPasswordIds.has(sharedPassword.id)}
                        {@const decrypted = decryptedSharedPasswords.get(sharedPassword.id)}
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center gap-1">
                                    {#if sharedPassword.credential_url}
                                        <button
                                            type="button"
                                            onclick={() => openUrl(sharedPassword.credential_url!)}
                                            class="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                                            title="Otevřít URL"
                                        >
                                            {sharedPassword.credential_title}
                                        </button>
                                        <div class="icon-sm-lblue"><MdLink/></div>
                                    {:else}
                                        <span class="text-sm font-medium text-gray-900">
                                            {sharedPassword.credential_title}
                                        </span>
                                    {/if}
                                </div>
                                {#if sharedPassword.credential_url}
                                    <div class="text-sm text-gray-500 truncate max-w-xs">
                                        {sharedPassword.credential_url}
                                    </div>
                                {/if}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <div class="flex items-center gap-2">
                                    <span class="font-mono">{sharedPassword.credential_username}</span>
                                    <button
                                        type="button"
                                        onclick={() => copyToClipboard(sharedPassword.credential_username)}
                                        class="text-gray-400 hover:text-gray-600"
                                        title="Kopírovat uživatelské jméno"
                                        aria-label="Kopírovat uživatelské jméno"
                                    >
                                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {#if isDecrypted && decrypted}
                                    <div class="flex items-center gap-2">
                                        <span class="font-mono bg-gray-100 px-2 py-1 rounded text-sm">{decrypted.password}</span>
                                        <button
                                            type="button"
                                            onclick={() => copyToClipboard(decrypted.password)}
                                            class="text-gray-400 hover:text-gray-600"
                                            title="Kopírovat heslo"
                                            aria-label="Kopírovat heslo"
                                        >
                                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onclick={() => onDecrypt?.(sharedPassword.id)}
                                        >
                                            Skrýt
                                        </Button>
                                    </div>
                                {:else}
                                    <div class="flex items-center gap-2">
                                        <span class="text-gray-400 font-mono">•••••••••</span>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onclick={() => onDecrypt?.(sharedPassword.id)}
                                        >
                                            Zobrazit
                                        </Button>
                                    </div>
                                {/if}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <span class="font-medium">{sharedPassword.owner_username}</span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(sharedPassword.created_at)}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        {#if totalPages > 1}
            <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div class="flex-1 flex justify-between sm:hidden">
                    <!-- Mobile pagination -->
                    <Button
                        variant="secondary"
                        onclick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                    >
                        Předchozí
                    </Button>
                    <Button
                        variant="secondary"
                        onclick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                    >
                        Další
                    </Button>
                </div>
                <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p class="text-sm text-gray-700">
                            Stránka <span class="font-medium">{currentPage}</span> z <span class="font-medium">{totalPages}</span>
                        </p>
                    </div>
                    <div>
                        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <!-- Previous button -->
                            <button
                                onclick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage <= 1}
                                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span class="sr-only">Předchozí</span>
                                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                                </svg>
                            </button>

                            <!-- Page numbers -->
                            {#each Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                                const startPage = Math.max(1, currentPage - 2);
                                const endPage = Math.min(totalPages, startPage + 4);
                                const adjustedStartPage = Math.max(1, endPage - 4);
                                return adjustedStartPage + i;
                            }).filter(page => page <= totalPages) as page}
                                <button
                                    onclick={() => handlePageChange(page)}
                                    class="relative inline-flex items-center px-4 py-2 border text-sm font-medium {page === currentPage 
                                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' 
                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}"
                                >
                                    {page}
                                </button>
                            {/each}

                            <!-- Next button -->
                            <button
                                onclick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages}
                                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span class="sr-only">Další</span>
                                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                                </svg>
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        {/if}
    {/if}
</div>