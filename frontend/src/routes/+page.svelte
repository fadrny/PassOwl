{#if $authUser.isLoggedIn}
    <!-- Dashboard pro přihlášené uživatele -->
    <div class="min-h-screen bg-gray-50">
        <Navigation />

        <main class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
            <div class="px-4 py-6 sm:px-0">
                <div class="border-4 border-dashed border-gray-200 rounded-lg p-8">
                    <h2 class="text-2xl font-bold text-gray-900 mb-4">Vítejte v PassOwl!</h2>
                    <p class="text-gray-600 mb-6">
                        Vaše bezpečná aplikace pro správu hesel je připravena k použití.
                    </p>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <DashboardCard
                            title="Hesla"
                            description="Spravujte svá hesla bezpečně"
                            buttonText="Zobrazit hesla"
                            onclick={() => console.log('Navigate to passwords')}
                        />
                        
                        <DashboardCard
                            title="Bezpečné poznámky"
                            description="Ukládejte důležité informace"
                            buttonText="Zobrazit poznámky"
                            onclick={() => console.log('Navigate to notes')}
                        />
                        
                        <DashboardCard
                            title="Kategorie"
                            description="Organizujte svá hesla"
                            buttonText="Spravovat kategorie"
                            onclick={() => console.log('Navigate to categories')}
                        />
                    </div>
                </div>
            </div>
        </main>
    </div>
{:else}
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
{/if}

<script>
    import { onMount } from 'svelte';
    import { authUser, AuthStore } from '$lib/stores/auth.js';
    import Navigation from '$lib/components/layout/Navigation.svelte';
    import DashboardCard from '$lib/components/layout/DashboardCard.svelte';

    onMount(() => {
        // Initialize auth store (it will check localStorage automatically)
        AuthStore.initialize();
    });
</script>
