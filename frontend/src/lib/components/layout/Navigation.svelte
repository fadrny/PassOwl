<script lang="ts">
	import { AuthStore, authUser } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';

	function handleLogout() {
		AuthStore.logout();
		goto('/');
	}
</script>

<nav class="bg-white shadow">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex justify-between h-16">
			<div class="flex items-center">
				<h1 class="text-xl font-semibold">🦉 PassOwl Dashboard</h1>
			</div>
			<div class="flex items-center space-x-4">
				<span class="text-gray-700">Vítejte, {$authUser.username}</span>
				<Button variant="danger" size="sm" onclick={handleLogout}>
					Odhlásit se
				</Button>
			</div>
		</div>
	</div>
</nav>
