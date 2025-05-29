<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { LayoutData } from '../../$types';
    import '../../../app.css';
    import { onMount, onDestroy } from 'svelte';
    import { goto } from '$app/navigation';
    import { authUser, AuthStore } from '$lib/stores/auth.js';
    import Navigation from '$lib/components/layout/Navigation.svelte';
    import ReauthModal from '$lib/components/modals/ReauthModal.svelte';
    import { reauthManager } from '$lib/services/reauth-manager';

    let { data, children }: { data: LayoutData, children: Snippet } = $props();

    // Reaktivní store pro re-auth modal
    let showReauthModal = $state(false);
    let isReauthInProgress = $state(false);

    // Unsubscribe funkce
    let unsubscribeModal: (() => void) | null = null;
    let unsubscribeProgress: (() => void) | null = null;

    onMount(() => {
        AuthStore.initialize();
        
        if (!$authUser.isLoggedIn) {
            goto('/login');
            return;
        }

        // Subscribe na store změny pro re-auth
        unsubscribeModal = reauthManager.showReauthModal.subscribe(value => {
            showReauthModal = value;
        });

        unsubscribeProgress = reauthManager.isReauthInProgress.subscribe(value => {
            isReauthInProgress = value;
        });

        // Spustíme monitoring šifrovacího klíče
        reauthManager.startMonitoring();
    });

    onDestroy(() => {
        // Cleanup subscriptions
        if (unsubscribeModal) {
            unsubscribeModal();
        }
        if (unsubscribeProgress) {
            unsubscribeProgress();
        }
        
        // Zastavíme monitoring
        reauthManager.stopMonitoring();
    });

    // Reagujeme na změny přihlášení
    $effect(() => {
        if ($authUser.isLoggedIn) {
            reauthManager.startMonitoring();
        } else {
            reauthManager.stopMonitoring();
        }
    });

    // Přidáme reaktivní klíč pro vynutění re-renderu
    let childrenKey = $state(0);

    function handleReauthSuccess() {
        reauthManager.onReauthSuccess();
        
        // Vynutíme re-render children incrementováním klíče
        childrenKey++;
    }

    function handleReauthTimeout() {
        reauthManager.onReauthTimeout();
    }
</script>

<svelte:head>
    <title>Dashboard - PassOwl</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
    <Navigation />
    
    <main class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
            {#key childrenKey}
                {@render children()}
            {/key}
        </div>
    </main>
</div>

<!-- Re-auth modal -->
<ReauthModal 
    open={showReauthModal}
    onSuccess={handleReauthSuccess}
    onTimeout={handleReauthTimeout}
    timeoutMinutes={10}
/>

<!-- Optional: Overlay při re-autentizaci -->
{#if isReauthInProgress && !showReauthModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
        <div class="bg-white rounded-lg p-6 max-w-sm mx-4">
            <div class="flex items-center">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span class="ml-3 text-gray-900">Ověřování...</span>
            </div>
        </div>
    </div>
{/if}