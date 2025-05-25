<script lang="ts">
	interface Props {
		title: string;
		description: string;
		buttonText: string;
		onclick?: () => void;
	}

	let { title, description, buttonText, onclick }: Props = $props();
</script>

<div class="bg-white p-6 rounded-lg shadow">
	<h3 class="text-lg font-semibold mb-2">{title}</h3>
	<p class="text-gray-600 mb-4">{description}</p>
	<button 
		class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
		{onclick}
	>
		{buttonText}
	</button>
</div>
