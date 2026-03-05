<script lang="ts">
	interface Props {
		variant?: 'short' | 'medium' | 'long';
		pulse?: boolean;
	}

	let { variant = 'medium', pulse = false }: Props = $props();

	const contentLines = {
		short: 2,
		medium: 3,
		long: 4
	};

	const pulseClass = pulse ? 'animate-pulse' : '';
</script>

<div
	class="mb-4 break-inside-avoid rounded-lg border border-gray-200 bg-white p-4 shadow-sm {pulseClass}"
>
	<!-- Header placeholder -->
	<div class="mb-3">
		<div class="mb-2 h-5 w-3/4 rounded bg-gray-200"></div>
	</div>

	<!-- Content placeholder -->
	<div class="mb-4 space-y-2">
		{#each Array.from({ length: contentLines[variant] }, (_, index) => index) as i (i)}
			<div
				class="h-3 rounded bg-gray-200 {i === contentLines[variant] - 1 ? 'w-1/2' : 'w-full'}"
			></div>
		{/each}
	</div>

	<!-- Footer placeholder -->
	<div class="flex items-center justify-between border-t border-gray-100 pt-2">
		<div class="h-3 w-16 rounded bg-gray-200"></div>
		<div class="h-6 w-6 rounded bg-gray-200"></div>
	</div>
</div>
