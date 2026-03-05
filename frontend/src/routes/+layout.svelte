<script lang="ts">
	import type { Snippet } from 'svelte';
	import '../app.css';

	let { children }: { children: Snippet } = $props();
</script>

<div class="flex min-h-screen flex-col bg-gray-50">
	<main class="flex-1">
		{@render children()}
	</main>

	<!-- Globální footer pro celou aplikaci -->
	<footer class="mt-auto border-t border-gray-200 bg-white">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
			<div class="flex flex-col items-center justify-between text-sm text-gray-500 sm:flex-row">
				<div class="flex items-center space-x-4">
					<span>
						<strong>PassOwl</strong> - Studentský projekt pro předmět KPTW2 a KDBS2
					</span>
				</div>
				<div class="mt-2 flex items-center space-x-1 sm:mt-0">
					<span class="text-xs">
						Autor: <strong>Marek Fadrný</strong>
					</span>
				</div>
			</div>
		</div>
	</footer>
</div>
