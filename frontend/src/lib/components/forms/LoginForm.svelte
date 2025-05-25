<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { AuthService } from '$lib/services/auth';
	import { AuthStore } from '$lib/stores/auth';
	import { validateLoginCredentials } from '$lib/utils/validation';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import ErrorMessage from '$lib/components/ui/ErrorMessage.svelte';
	import type { LoginCredentials } from '$lib/types/auth';

	interface Props {
		showSuccessMessage?: boolean;
	}

	let { showSuccessMessage = false }: Props = $props();

	let credentials: LoginCredentials = $state({ username: '', password: '' });
	let errors: string[] = $state([]);
	let loading = $state(false);

	async function handleSubmit() {
		if (loading || !browser) return;

		const validation = validateLoginCredentials(credentials);
		if (!validation.isValid) {
			errors = validation.errors;
			return;
		}

		loading = true;
		errors = [];

		try {
			const result = await AuthService.login(credentials);
			
			if (result.error) {
				errors = [result.error.detail];
				return;
			}

			const { access_token, encryptionSalt } = result.data!;
			AuthStore.setAuthData(access_token, credentials.username, encryptionSalt);
			
			goto('/');
		} catch (err) {
			console.error('Login error:', err);
			errors = ['Nastala neočekávaná chyba'];
		} finally {
			loading = false;
		}
	}
</script>

{#if showSuccessMessage}
	<div class="mb-4 rounded-md bg-green-50 p-4">
		<div class="flex">
			<svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
				<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L7.53 10.23a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
			</svg>
			<div class="ml-3">
				<p class="text-sm font-medium text-green-800">
					Registrace byla úspěšná! Nyní se můžete přihlásit.
				</p>
			</div>
		</div>
	</div>
{/if}

<form class="space-y-6" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
	<Input
		type="text"
		name="username"
		id="username"
		label="Uživatelské jméno"
		autocomplete="username"
		required
		bind:value={credentials.username}
	/>

	<Input
		type="password"
		name="password"
		id="password"
		label="Heslo"
		autocomplete="current-password"
		required
		bind:value={credentials.password}
	/>

	{#if errors.length > 0}
		<ErrorMessage message={errors[0]} />
	{/if}

	<Button 
		type="submit" 
		variant="primary" 
		size="lg" 
		disabled={loading}
		loading={loading}
	>
		{loading ? 'Přihlašování...' : 'Přihlásit se'}
	</Button>
</form>

<p class="mt-6 text-center text-sm text-gray-500">
	Nemáte vytvořený účet?
	<a href="/register" class="font-semibold text-indigo-600 hover:text-indigo-500">
		Zaregistrujte se
	</a>
</p>
