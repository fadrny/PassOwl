<script lang="ts">
	interface Props {
		type?: 'button' | 'submit' | 'reset';
		variant?: 'primary' | 'secondary' | 'danger';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		loading?: boolean;
		onclick?: () => void;
		children: any;
	}

	let { 
		type = 'button',
		variant = 'primary',
		size = 'md',
		disabled = false,
		loading = false,
		onclick,
		children
	}: Props = $props();

	const baseClasses = 'font-semibold rounded focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
	
	const variantClasses = {
		primary: 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600',
		secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:outline-gray-500',
		danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600'
	};
	
	const sizeClasses = {
		sm: 'px-2 py-1 text-sm',
		md: 'px-3 py-1.5 text-sm',
		lg: 'px-3.5 py-2.5 text-base'
	};

	const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;
</script>

<button 
	{type}
	class={classes}
	disabled={disabled || loading}
	{onclick}
>
	{#if loading}
		<span class="flex items-center gap-2">
			<svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
			</svg>
			{@render children()}
		</span>
	{:else}
		{@render children()}
	{/if}
</button>
