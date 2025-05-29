<script lang="ts">
	interface Props {
		type?: 'text' | 'password' | 'email' | 'url';
		name: string;
		id: string;
		label: string;
		value: string;
		placeholder?: string;
		required?: boolean;
		error?: string;
	}

	let { 
		type = 'text',
		name,
		id,
		label,
		value = $bindable(),
		placeholder,
		required = false,
		error
	}: Props = $props();

	const baseInputClasses = 'block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 sm:text-sm';
	const inputClasses = error 
		? `${baseInputClasses} outline-red-300 focus:outline-red-600`
		: `${baseInputClasses} outline-gray-300 focus:outline-indigo-600`;
</script>

<div>
	<label for={id} class="block text-sm font-medium text-gray-900">
		{label}
	</label>
	<div class="mt-2">
		<input
			{type}
			{name}
			{id}
			{placeholder}
			{required}
			bind:value
			class={inputClasses}
		/>
	</div>
	{#if error}
		<p class="mt-1 text-sm text-red-600">{error}</p>
	{/if}
</div>

