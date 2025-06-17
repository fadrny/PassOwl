<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { AuditManager } from '$lib/services/audit-manager';
    import type { AuditLog } from '$lib/services/api';
    import PageHeader from '$lib/components/layout/PageHeader.svelte';
    import ErrorMessage from '$lib/components/ui/ErrorMessage.svelte';

    // Stavy
    let logs: AuditLog[] = $state([]);
    let loading = $state(false);
    let initialLoading = $state(true);
    let error: string | null = $state(null);
    let hasMoreLogs = $state(true);
    let loadMoreTrigger: HTMLDivElement | null = $state(null);

    // Pagination
    let currentPage = $state(0);
    const pageSize = 50;

    // Intersection Observer pro infinity scroll
    let intersectionObserver: IntersectionObserver | null = null;

    onMount(() => {
        loadFirstPage();
        setupIntersectionObserver();
    });

    onDestroy(() => {
        if (intersectionObserver) {
            intersectionObserver.disconnect();
        }
    });

    function setupIntersectionObserver() {
        intersectionObserver = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry.isIntersecting && hasMoreLogs && !loading && !initialLoading) {
                    loadMoreLogs();
                }
            },
            {
                rootMargin: '100px'
            }
        );
    }

    // Přidání observe po vytvoření triggeru
    $effect(() => {
        if (loadMoreTrigger && intersectionObserver) {
            intersectionObserver.observe(loadMoreTrigger);
        }
    });

    async function loadFirstPage() {
        initialLoading = true;
        error = null;
        logs = [];
        currentPage = 0;
        hasMoreLogs = true;

        await loadLogsPage(0);
        initialLoading = false;
    }

    async function loadMoreLogs() {
        if (!hasMoreLogs || loading) return;
        
        loading = true;
        const nextPage = currentPage + 1;
        await loadLogsPage(nextPage);
        loading = false;
    }

    async function loadLogsPage(page: number) {
        try {
            const skip = page * pageSize;
            const result = await AuditManager.getAuditLogs({ skip, limit: pageSize });

            if (result.error) {
                if (page === 0) {
                    error = result.error.detail;
                }
                return;
            }

            const newLogs = result.data || [];
            
            if (page === 0) {
                logs = newLogs;
            } else {
                logs = [...logs, ...newLogs];
            }
            
            currentPage = page;
            // Pokud je počet vrácených logů menší než pageSize, nejsou už další
            hasMoreLogs = newLogs.length === pageSize;

        } catch (err) {
            console.error('Error loading logs page:', err);
            if (page === 0) {
                error = 'Nepodařilo se načíst audit logy';
            }
        }
    }

    function formatDate(dateString: string): string {
        return new Date(dateString).toLocaleString('cs-CZ');
    }

    function getActionColor(action: string): string {
        const actionLower = action.toLowerCase();
        if (actionLower.includes('create') || actionLower.includes('add')) {
            return 'text-green-600 bg-green-50';
        } else if (actionLower.includes('update') || actionLower.includes('edit')) {
            return 'text-blue-600 bg-blue-50';
        } else if (actionLower.includes('delete') || actionLower.includes('remove')) {
            return 'text-red-600 bg-red-50';
        } else if (actionLower.includes('login') || actionLower.includes('auth')) {
            return 'text-purple-600 bg-purple-50';
        } else if (actionLower.includes('share')) {
            return 'text-orange-600 bg-orange-50';
        }
        return 'text-gray-600 bg-gray-50';
    }
</script>

<svelte:head>
    <title>Audit Logy - PassOwl Admin</title>
</svelte:head>

<div class="space-y-6">
    <PageHeader 
        title="Audit Logy"
        description="Historie všech akcí v systému"
    />

    <!-- Content -->
    {#if initialLoading}
        <div class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span class="ml-2 text-gray-600">Načítání audit logů...</span>
        </div>
    {:else if error}
        <ErrorMessage message={error} />
        <div class="flex justify-center">
            <button
                type="button"
                onclick={loadFirstPage}
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                Zkusit znovu
            </button>
        </div>
    {:else if logs.length === 0}
        <div class="text-center py-12">
            <svg
                class="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Žádné logy</h3>
            <p class="mt-1 text-sm text-gray-500">V systému zatím nejsou žádné audit logy.</p>
        </div>
    {:else}
        <!-- Logy -->
        <div class="bg-white shadow overflow-hidden sm:rounded-md">
            <ul class="divide-y divide-gray-200">
                {#each logs as log (log.id)}
                    <li class="px-6 py-4 hover:bg-gray-50">
                        <div class="flex items-center justify-between">
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center space-x-3">
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getActionColor(log.action)}">
                                        {log.action}
                                    </span>
                                    {#if log.resource_type}
                                        <span class="text-sm text-gray-500">
                                            {log.resource_type}
                                            {#if log.resource_id}
                                                #{log.resource_id}
                                            {/if}
                                        </span>
                                    {/if}
                                </div>
                                <div class="mt-1">
                                    <div class="flex items-center space-x-2 text-sm text-gray-900">
                                        <span class="font-medium">
                                            {log.username || `User ID: ${log.user_id}`}
                                        </span>
                                        <span class="text-gray-500">•</span>
                                        <span class="text-gray-500">
                                            {formatDate(log.created_at)}
                                        </span>
                                    </div>
                                    {#if log.details}
                                        <p class="mt-1 text-sm text-gray-600">{log.details}</p>
                                    {/if}
                                </div>
                            </div>
                        </div>
                    </li>
                {/each}
            </ul>
        </div>

        <!-- Infinite scroll trigger pouze pokud existují další logy -->
        {#if hasMoreLogs}
            <div bind:this={loadMoreTrigger} class="flex justify-center py-8">
                {#if loading}
                    <div class="flex items-center">
                        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span class="ml-2 text-gray-600">Načítám další logy...</span>
                    </div>
                {:else}
                    <button
                        type="button"
                        onclick={loadMoreLogs}
                        class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Načíst další logy
                    </button>
                {/if}
            </div>
        {:else if logs.length > 0}
            <div class="text-center py-8 text-gray-500 text-sm">
                <div class="flex items-center justify-center">
                    <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Všechny logy načteny
                </div>
            </div>
        {/if}
    {/if}
</div>