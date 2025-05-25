<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { AuthService } from '$lib/services/auth';
	import { validateRegisterCredentials } from '$lib/utils/validation';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import ErrorMessage from '$lib/components/ui/ErrorMessage.svelte';
	import type { RegisterCredentials } from '$lib/types/auth';

	let credentials: RegisterCredentials = $state({ 
		username: '', 
		password: '', 
		passwordConfirm: '' 
	});
	let errors: string[] = $state([]);
	let loading = $state(false);

	async function handleSubmit() {
		if (loading || !browser) return;

		const validation = validateRegisterCredentials(credentials);
		if (!validation.isValid) {
			errors = validation.errors;
			return;
		}

		loading = true;
		errors = [];

		try {
			const result = await AuthService.register(credentials);
			
			if (result.error) {
				errors = [result.error.detail];
				return;
			}

			goto('/login?registered=true');
		} catch (err) {
			console.error('Registration error:', err);
			errors = ['Nastala neočekávaná chyba'];
		} finally {
			loading = false;
		}
	}
</script>

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
		autocomplete="new-password"
		required
		bind:value={credentials.password}
	/>

	<Input
		type="password"
		name="password-confirm"
		id="password-confirm"
		label="Heslo pro kontrolu"
		autocomplete="new-password"
		required
		bind:value={credentials.passwordConfirm}
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
		{loading ? 'Registrování...' : 'Registrovat se'}
	</Button>
</form>
