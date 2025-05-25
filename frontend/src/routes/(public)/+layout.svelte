<script lang="ts">
	import '../../app.css';
	import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { authUser, AuthStore } from '$lib/stores/auth.js';

	let { data, children }: { data: LayoutData, children: Snippet } = $props();

    onMount(() => {
        AuthStore.initialize();
        
        if ($authUser.isLoggedIn) {
            goto('/dashboard');
        }
    });
</script>

<div class="mx-auto flex size-full max-w-3xl flex-col pt-10">
	<main id="content">
		<div class="bg-white">
			<div class="relative isolate px-6 pt-14 lg:px-8">
				<div
					class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
					aria-hidden="true"
				>
					<div
						class="aspect-1155/678 w-144.5 rotate-30 bg-linear-to-tr sm:w-288.75 relative left-[calc(50%-11rem)] -translate-x-1/2 from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)]"
						style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
					></div>
				</div>
					{@render children()}
			</div>
		</div>
	</main>
</div>
