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

<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200 break-inside-avoid mb-4">
    <!-- Header s názvem -->
    <div class="mb-3">
        <h3 class="text-lg font-medium text-gray-900 line-clamp-2 leading-tight">
            {note.title}
        </h3>
    </div>
    
    <!-- Obsah poznámky -->
    <div class="mb-4">
        <p class="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">
            {truncateContent(note.content)}
        </p>
    </div>
    
    <!-- Footer s datem a editací -->
    <div class="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
        <span class="font-medium">
            {formatDate(note.created_at)}
        </span>
        
        <button
            onclick={handleEdit}
            class="p-1.5 hover:bg-gray-100 rounded-md transition-colors duration-150 flex items-center group"
            title="Upravit poznámku"
        >
            <svg 
                class="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" 
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
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
</style>