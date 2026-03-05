<script lang="ts">
	import type { DecryptedNote } from '$lib/services/notes-manager';

	interface Props {
		note: DecryptedNote;
		onEdit?: (note: DecryptedNote) => void;
	}

	let { note, onEdit }: Props = $props();

	function handleEdit() {
		onEdit?.(note);
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('cs-CZ', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	// Zkrácení obsahu pro náhled
	const truncateContent = (content: string, maxLength: number = 150): string => {
		if (content.length <= maxLength) return content;
		return content.substring(0, maxLength) + '...';
	};
</script>

<div
	class="mb-4 break-inside-avoid rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md"
>
	<!-- Header s názvem -->
	<div class="mb-3">
		<h3 class="line-clamp-2 text-lg leading-tight font-medium text-gray-900">
			{note.title}
		</h3>
	</div>

	<!-- Obsah poznámky -->
	<div class="mb-4">
		<p class="text-sm leading-relaxed whitespace-pre-wrap text-gray-600">
			{truncateContent(note.content)}
		</p>
	</div>

	<!-- Footer s datem a editací -->
	<div
		class="flex items-center justify-between border-t border-gray-100 pt-2 text-xs text-gray-500"
	>
		<span class="font-medium">
			{formatDate(note.created_at)}
		</span>

		<button
			onclick={handleEdit}
			class="group flex items-center rounded-md p-1.5 transition-colors duration-150 hover:bg-gray-100"
			title="Upravit poznámku"
			aria-label="Upravit poznámku"
		>
			<svg
				class="h-4 w-4 text-gray-400 transition-colors group-hover:text-gray-600"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
				/>
			</svg>
		</button>
	</div>
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		line-clamp: 2;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
