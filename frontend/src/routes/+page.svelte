<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { authUser, AuthStore } from '$lib/stores/auth.js';

    onMount(() => {
        // Initialize auth store (it will check localStorage automatically)
        AuthStore.initialize();
        
        // Redirect to dashboard if logged in
        if ($authUser.isLoggedIn) {
            goto('/dashboard');
        }
    });
</script>

<svelte:head>
    <title>PassOwl - Správa hesel</title>
</svelte:head>

<!-- Úvodní stránka pro nepřihlášené uživatele -->
<div class="text-center">
    <h1 class="text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl">
        🦉 PassOwl
    </h1>
    <p class="mt-8 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">
        Aplikace pro ukládání, správu a sdílení hesel s koncovým šifrováním
    </p>
    <div class="mt-10 flex items-center justify-center gap-x-6">
        <a
            href="/login"
            class="shadow-xs rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
            Přihlásit se
        </a>
        <a href="/register" class="text-sm/6 font-semibold text-gray-900">
            Registrovat se<span aria-hidden="true">→</span>
        </a>
    </div>
</div>