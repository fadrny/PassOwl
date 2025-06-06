<script lang="ts">
    import Button from '../ui/Button.svelte';

    interface Props {
        title: string;
        description: string;
        buttonText: string;
        count?: number | null;
        loading?: boolean;
        onclick?: () => void;
    }

    let { 
        title, 
        description, 
        buttonText, 
        count = null,
        loading = false,
        onclick 
    }: Props = $props();
</script>

<div class="bg-white overflow-hidden shadow rounded-lg">
    <div class="p-5">
        <div class="flex items-center">
            <div class="flex-shrink-0">
                <!-- Ikony podle typu karty -->
                {#if title.includes('Hesla')}
                    <svg class="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                {:else if title.includes('poznámky')}
                    <svg class="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                {:else if title.includes('Kategorie')}
                    <svg class="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                {:else}
                    <!-- Fallback ikona -->
                    <svg class="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                {/if}
            </div>
            <div class="ml-5 w-0 flex-1">
                <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">
                        {title}
                    </dt>
                    <dd class="flex items-center">
                        <div class="text-lg font-medium text-gray-900">
                            {#if loading}
                                <div class="animate-pulse flex space-x-4">
                                    <div class="h-6 bg-gray-200 rounded w-12"></div>
                                </div>
                            {:else if count !== null}
                                {count}
                                {#if count === 1}
                                    {#if title.includes('Hesla')}
                                        heslo
                                    {:else if title.includes('poznámky')}
                                        poznámka
                                    {:else if title.includes('Kategorie')}
                                        kategorie
                                    {:else}
                                        položka
                                    {/if}
                                {:else if count >= 2 && count <= 4}
                                    {#if title.includes('Hesla')}
                                        hesla
                                    {:else if title.includes('poznámky')}
                                        poznámky
                                    {:else if title.includes('Kategorie')}
                                        kategorie
                                    {:else}
                                        položky
                                    {/if}
                                {:else}
                                    {#if title.includes('Hesla')}
                                        hesel
                                    {:else if title.includes('poznámky')}
                                        poznámek
                                    {:else if title.includes('Kategorie')}
                                        kategorií
                                    {:else}
                                        položek
                                    {/if}
                                {/if}
                            {:else}
                                <!-- Placeholder když nejsou statistiky dostupné -->
                                <span class="text-gray-400">—</span>
                            {/if}
                        </div>
                    </dd>
                </dl>
            </div>
        </div>
        
        <div class="mt-3">
            <p class="text-sm text-gray-600 mb-4">
                {description}
            </p>
            
            <Button
                variant="primary"
                size="md"
                onclick={onclick}
            >
                {buttonText}
            </Button>
        </div>
    </div>
</div>
