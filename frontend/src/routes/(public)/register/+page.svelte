<script>
	import RegisterForm from '$lib/components/forms/RegisterForm.svelte';
</script>

<div class="flex-1 flex-col justify-center px-6 py-12 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-sm">
        <h1 class="text-center text-xl font-bold tracking-tight text-gray-900">🦉 PassOwl</h1>
		<h2 class="mt-5 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
			Vytvořit nový účet
		</h2>
	</div>

	<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
		<RegisterForm />

		<p class="mt-10 text-center text-sm/6 text-gray-500">
			Již máte účet?
			<a href="/login" class="font-semibold text-indigo-600 hover:text-indigo-500">
				Přihlaste se
			</a>
		</p>
	</div>
</div>
