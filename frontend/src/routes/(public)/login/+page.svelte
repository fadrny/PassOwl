<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import LoginForm from '$lib/components/forms/LoginForm.svelte';

	let showSuccessMessage = $state(false);

	onMount(() => {
		showSuccessMessage = $page.url.searchParams.get('registered') === 'true';
	});
</script>

<svelte:head>
	<title>Přihlášení - PassOwl</title>
</svelte:head>

<div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-sm">
		<h1 class="text-center text-xl font-bold tracking-tight text-gray-900">🦉 PassOwl</h1>
		<h2 class="mt-5 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
			Přihlásit se do účtu
		</h2>
	</div>

	<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
		<LoginForm {showSuccessMessage} />
	</div>
</div>

<p class="mt-6 text-center text-sm text-gray-500">
	Nemáte vytvořený účet?
	<a href="/register" class="font-semibold text-indigo-600 hover:text-indigo-500 w-full">
		Zaregistrujte se
	</a>
</p>
