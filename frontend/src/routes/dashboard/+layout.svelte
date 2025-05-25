<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { LayoutData } from './$types';
    import '../../app.css';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { authUser, AuthStore } from '$lib/stores/auth.js';
    import Navigation from '$lib/components/layout/Navigation.svelte';

    let { data, children }: { data: LayoutData, children: Snippet } = $props();

    onMount(() => {
        AuthStore.initialize();
        
        if (!$authUser.isLoggedIn) {
            goto('/login');
        }
    });
</script>

<svelte:head>
    <title>Dashboard - PassOwl</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
    <Navigation />
    
    <main class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
            {@render children()}
        </div>
    </main>
</div>