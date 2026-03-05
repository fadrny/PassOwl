<script lang="ts">
	import MdArrowForward from 'svelte-icons/md/MdArrowForward.svelte';
</script>

<!-- Úvodní stránka pro nepřihlášené uživatele -->
<div class="text-center">
	<h1 class="text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">
		🦉 PassOwl
	</h1>
	<p class="mt-8 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
		Aplikace pro ukládání, správu a sdílení hesel s koncovým šifrováním
	</p>
	<div class="mt-10 flex items-center justify-center gap-x-6">
		<a
			href="/login"
			class="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
		>
			Přihlásit se
		</a>
		<a href="/register" class="text-sm/6 font-semibold text-gray-900">
			Registrovat se<span aria-hidden="true"
				><div class="icon-sm-black"><MdArrowForward /></div></span
			>
		</a>
	</div>
</div>
