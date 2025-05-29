<script lang="ts">
    import { onMount } from 'svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import NoteCard from '$lib/components/ui/NoteCard.svelte';
    import NoteCardSkeleton from '$lib/components/ui/NoteCardSkeleton.svelte';
    import AddNoteModal from '$lib/components/modals/AddNoteModal.svelte';
    import EditNoteModal from '$lib/components/modals/EditNoteModal.svelte';
    import { NotesManager, type DecryptedNote } from '$lib/services/notes-manager';
    import type { SecureNote } from '$lib/services/api';
    import PageHeader from '$lib/components/layout/PageHeader.svelte';

    // Typ pro display item
    type DisplayItem = {
        type: 'note' | 'skeleton';
        note?: DecryptedNote;
        id: number;
        variant?: 'short' | 'medium' | 'long';
    };

    let notes: SecureNote[] = $state([]);
    let decryptedNotes = $state(new Map<number, DecryptedNote>());
    let decryptingNotes = $state(new Set<number>());
    let initialLoading = $state(false); // Jen pro první načtení
    let error: string | null = $state(null);
    let showAddModal = $state(false);
    let showEditModal = $state(false);
    let editingNote: DecryptedNote | undefined = $state(undefined);

    onMount(() => {
        loadNotes();
    });

    async function loadNotes() {
        initialLoading = true;
        error = null;
        decryptedNotes.clear();
        decryptingNotes.clear();

        try {
            const result = await NotesManager.getNotes({ limit: 100 });

            if (result.error) {
                error = result.error.detail;
                return;
            }

            notes = result.data || [];
            
            initialLoading = false;
            
            if (NotesManager.isEncryptionKeyAvailable()) {
                decryptNotesProgressively();
            } else {
                console.warn('Encryption key not available');
            }
        } catch (err) {
            console.error('Error loading notes:', err);
            error = 'Nepodařilo se načíst poznámky';
            initialLoading = false;
        }
    }

    async function decryptNotesProgressively() {
        for (const note of notes) {
            // Označíme poznámku jako "dešifruje se"
            decryptingNotes.add(note.id);
            decryptingNotes = new Set(decryptingNotes);

            try {
                const result = await NotesManager.decryptNote(note);
                
                if (result.data) {
                    // Úspěšně dešifrováno - přidáme do mapy
                    decryptedNotes.set(note.id, result.data);
                    decryptedNotes = new Map(decryptedNotes);
                } else {
                    console.error('Failed to decrypt note:', note.id, result.error);
                }
            } catch (err) {
                console.error(`Error decrypting note ${note.id}:`, err);
            }

            // Odebereme z "dešifruje se"
            decryptingNotes.delete(note.id);
            decryptingNotes = new Set(decryptingNotes);
            
            // Kratší pauza pro plynulé zobrazování
            await new Promise(resolve => setTimeout(resolve, 250));
        }
    }

    function handleEdit(note: DecryptedNote) {
        editingNote = note;
        showEditModal = true;
    }

    function handleNoteAdded() {
        loadNotes();
        showAddModal = false;
    }

    function handleNoteUpdated() {
        loadNotes();
        showEditModal = false;
    }

    function handleNoteDeleted() {
        loadNotes();
        showEditModal = false;
    }

    // Generujeme fixní varianty pro konzistentní zobrazení
    function getSkeletonVariant(noteId: number): 'short' | 'medium' | 'long' {
        // Použijeme ID pro konzistentní variantu
        const variants: ('short' | 'medium' | 'long')[] = ['short', 'medium', 'long'];
        return variants[noteId % 3];
    }

    // Renderovaná data pro zobrazení (kombinace dešifrovaných a loading)
    const displayItems = $derived(() => {
        const items: DisplayItem[] = [];
        
        for (const note of notes) {
            if (decryptedNotes.has(note.id)) {
                // Dešifrovaná poznámka
                items.push({
                    type: 'note',
                    note: decryptedNotes.get(note.id)!,
                    id: note.id
                });
            } else {
                // Ještě nedešifrovaná - skeleton (ať už se dešifruje nebo ne)
                items.push({
                    type: 'skeleton',
                    id: note.id,
                    variant: getSkeletonVariant(note.id)
                });
            }
        }
        
        return items;
    });
</script>

<svelte:head>
    <title>Poznámky - PassOwl</title>
</svelte:head>

<div class="space-y-6">
    <PageHeader 
        title="Poznámky"
        description="Tady jsou Vaše poznámky v bezpečí."
        buttonText="Přidat Poznámku"
        onButtonClick={() => showAddModal = true}
    />

    <!-- Debug info -->
    {#if import.meta.env.DEV}
        <div class="bg-gray-100 p-2 text-xs">
            Debug: notes={notes.length}, decrypted={decryptedNotes.size}, decrypting={decryptingNotes.size}, 
            keyAvailable={NotesManager.isEncryptionKeyAvailable()}, displayItems={displayItems.length}
        </div>
    {/if}

    <!-- Content -->
    {#if initialLoading}
        <div class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span class="ml-2 text-gray-600">Načítání poznámek...</span>
        </div>
    {:else if error}
        <div class="bg-red-50 border border-red-200 rounded-md p-4">
            <div class="flex">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
                <div class="ml-3">
                    <h3 class="text-sm font-medium text-red-800">Chyba při načítání</h3>
                    <p class="mt-1 text-sm text-red-700">{error}</p>
                </div>
            </div>
        </div>
    {:else if notes.length === 0}
        <div class="text-center py-12">
            <svg
                class="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Žádné poznámky</h3>
            <p class="mt-1 text-sm text-gray-500">Začněte přidáním první poznámky.</p>
        </div>
    {:else}
        <!-- Masonry grid s poznámkami a loading placeholdery -->
        <div class="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {#each displayItems() as item (item.id)}
                {#if item.type === 'note' && item.note}
                    <div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <NoteCard note={item.note} onEdit={handleEdit} />
                    </div>
                {:else if item.type === 'skeleton'}
                    <NoteCardSkeleton variant={item.variant} />
                {/if}
            {/each}
        </div>
    {/if}
</div>

<!-- Modály -->
<AddNoteModal 
    open={showAddModal} 
    onClose={() => showAddModal = false}
    onNoteAdded={handleNoteAdded}
/>

<EditNoteModal
    open={showEditModal}
    onClose={() => {
        showEditModal = false;
        editingNote = undefined;
    }}
    note={editingNote}
    onNoteUpdated={handleNoteUpdated}
    onNoteDeleted={handleNoteDeleted}
/>