<script lang="ts">
    import { onMount } from 'svelte';
    import DashboardCard from '$lib/components/layout/DashboardCard.svelte';
    import { goto } from '$app/navigation';
    import { StatsManager } from '$lib/services/stats-manager';
    import type { UserStats } from '$lib/services/api';

    let stats: UserStats | null = $state(null);
    let loading = $state(true);
    let error: string | null = $state(null);

    onMount(async () => {
        await loadStats();
    });

    async function loadStats() {
        loading = true;
        error = null;
        
        try {
            const result = await StatsManager.getUserStats();
            
            if (result.error) {
                error = result.error.detail;
                console.error('Error loading stats:', result.error);
            } else {
                stats = result.data || null;
            }
        } catch (err) {
            console.error('Failed to load stats:', err);
            error = 'Nepodařilo se načíst statistiky';
        } finally {
            loading = false;
        }
    }
</script>

<svelte:head>
    <title>Dashboard - PassOwl</title>
</svelte:head>

<div class="space-y-6">
    <!-- Hlavní nadpis -->
    <div class="border-4 border-dashed border-gray-200 rounded-lg p-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Vítejte v PassOwl!</h1>
        <p class="text-lg text-gray-600 mb-6">
            Vaše bezpečná aplikace pro správu hesel je připravena k použití.
        </p>
        
        {#if error}
            <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                <div class="flex">
                    <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    <div class="ml-3">
                        <p class="text-sm text-yellow-700">
                            {error}
                        </p>
                    </div>
                </div>
            </div>
        {/if}
        
        <!-- Statistiky -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DashboardCard
                title="Hesla"
                description="Spravujte svá hesla bezpečně a organizovaně"
                buttonText="Zobrazit hesla"
                count={stats ? stats.own_credentials_count : null}
                loading={loading}
                onclick={() => goto('/dashboard/passwords')}
            />
            
            <DashboardCard
                title="Bezpečné poznámky"
                description="Ukládejte důležité informace šifrovaně"
                buttonText="Zobrazit poznámky"
                count={stats ? stats.secure_notes_count : null}
                loading={loading}
                onclick={() => goto('/dashboard/notes')}
            />
            
            <DashboardCard
                title="Kategorie"
                description="Organizujte svá hesla do kategorií"
                buttonText="Spravovat kategorie"
                count={stats ? stats.categories_count : null}
                loading={loading}
                onclick={() => goto('/dashboard/categories')}
            />
        </div>

        <!-- Dodatečné statistiky -->
        {#if stats && stats.shared_credentials_count > 0}
            <div class="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div class="flex items-center">
                    <svg class="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-blue-800">Sdílená hesla</h3>
                        <div class="mt-1 text-sm text-blue-700">
                            <p>
                                S vámi je sdíleno <span class="font-semibold">{stats.shared_credentials_count}</span>
                                {#if stats.shared_credentials_count === 1}
                                    heslo
                                {:else if stats.shared_credentials_count >= 2 && stats.shared_credentials_count <= 4}
                                    hesla
                                {:else}
                                    hesel
                                {/if}
                                od jiných uživatelů.
                            </p>
                        </div>
                        <div class="mt-3">
                            <button
                                type="button"
                                onclick={() => goto('/dashboard/passwords')}
                                class="text-sm font-medium text-blue-600 hover:text-blue-500"
                            >
                                Zobrazit sdílená hesla →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        {/if}
    </div>

</div>