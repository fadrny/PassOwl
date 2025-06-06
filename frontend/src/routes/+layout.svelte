<script lang="ts">
    import type { Snippet } from 'svelte';
    import '../app.css';

    let { children }: { children: Snippet } = $props();
</script>

<div class="min-h-screen bg-gray-50 flex flex-col">
    <main class="flex-1">
        {@render children()}
    </main>

    <!-- Globální footer pro celou aplikaci -->
    <footer class="bg-white border-t border-gray-200 mt-auto">
        <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div class="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500">
                <div class="flex items-center space-x-4">
                    <span>
                        <strong>PassOwl</strong> - Studentský projekt pro předmět KPTW2
                    </span>
                </div>
                <div class="mt-2 sm:mt-0 flex items-center space-x-1">
                    <span class="text-xs">
                        Autor: <strong>Marek Fadrný</strong>
                    </span>
                </div>
            </div>
        </div>
    </footer>
</div>