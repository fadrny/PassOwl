<script lang="ts">
	interface Props {
		message: string;
		children?: any;
	}

	let { message, children }: Props = $props();
</script>

<div class="rounded-md bg-red-50 p-4">
	<div class="flex">
		<div class="flex-shrink-0">
			<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
				<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
			</svg>
		</div>
		<div class="ml-3">
			<h3 class="text-sm font-medium text-red-800">
				{message}
			</h3>
			{#if children}
				<div class="mt-2 text-sm text-red-700">
					{@render children()}
				</div>
			{/if}
		</div>
	</div>
</div>
