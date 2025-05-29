<script lang="ts">
    import Modal from '../ui/Modal.svelte';
    import Input from '$lib/components/ui/Input.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import ErrorMessage from '$lib/components/ui/ErrorMessage.svelte';
    import { NotesManager, type NoteUpdateData, type DecryptedNote } from '$lib/services/notes-manager';

    interface Props {
        open: boolean;
        onClose: () => void;
        note?: DecryptedNote;
        onNoteUpdated?: () => void;
        onNoteDeleted?: () => void;
    }

    let { open, onClose, note, onNoteUpdated, onNoteDeleted }: Props = $props();

    let formData: { title: string; content: string } = $state({
        title: '',
        content: ''
    });

    let loading = $state(false);
    let deleting = $state(false);
    let errors: string[] = $state([]);

    // Aktualizace formuláře při změně poznámky
    $effect(() => {
        if (note && open) {
            formData = {
                title: note.title,
                content: note.content
            };
            errors = [];
        }
    });

    function resetForm() {
        formData = {
            title: '',
            content: ''
        };
        loading = false;
        deleting = false;
        errors = [];
    }

    function handleClose() {
        resetForm();
        onClose();
    }

    function validateForm(): boolean {
        errors = [];

        if (!formData.title.trim()) {
            errors.push('Název je povinný');
        }

        if (!formData.content.trim()) {
            errors.push('Obsah je povinný');
        }

        return errors.length === 0;
    }

    async function handleSubmit() {
        if (!note) return;
        if (!validateForm()) return;

        if (!NotesManager.isEncryptionKeyAvailable()) {
            errors = ['Šifrovací klíč není dostupný. Obnovte stránku a přihlaste se znovu.'];
            return;
        }

        loading = true;
        errors = [];

        try {
            const updateData: NoteUpdateData = {
                title: formData.title,
                content: formData.content
            };

            const result = await NotesManager.updateNote(note.id, updateData);

            if (result.error) {
                errors = [result.error.detail];
                return;
            }

            onNoteUpdated?.();
            handleClose();
        } catch (err) {
            console.error('Error updating note:', err);
            errors = ['Nastala neočekávaná chyba při aktualizaci poznámky'];
        } finally {
            loading = false;
        }
    }

    async function handleDelete() {
        if (!note) return;

        const confirmed = confirm('Opravdu chcete smazat tuto poznámku? Tato akce je nevratná.');
        if (!confirmed) return;

        deleting = true;
        errors = [];

        try {
            const result = await NotesManager.deleteNote(note.id);

            if (result.error) {
                errors = [result.error.detail];
                return;
            }

            onNoteDeleted?.();
            handleClose();
        } catch (err) {
            console.error('Error deleting note:', err);
            errors = ['Nastala neočekávaná chyba při mazání poznámky'];
        } finally {
            deleting = false;
        }
    }
</script>

<Modal {open} onClose={handleClose} title="Upravit poznámku">
    {#snippet children()}
        <form class="space-y-4">
            <Input
                type="text"
                label="Název *"
                bind:value={formData.title}
                required
                disabled={loading || deleting}
            />

            <div class="space-y-2">
                <label for="content" class="block text-sm font-medium text-gray-700">
                    Obsah *
                </label>
                <textarea
                    id="content"
                    name="content"
                    rows="6"
                    placeholder="Obsah poznámky..."
                    required
                    bind:value={formData.content}
                    disabled={loading || deleting}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                ></textarea>
            </div>

            {#if errors.length > 0}
                <ErrorMessage message={errors[0]} />
            {/if}
        </form>
    {/snippet}

    {#snippet footer()}
        <div class="flex justify-between">
            <Button 
                variant="danger" 
                onclick={handleDelete} 
                disabled={loading || deleting}
                loading={deleting}
            >
                {deleting ? 'Mazání...' : 'Smazat poznámku'}
            </Button>
            <div class="flex space-x-3">
                <Button variant="secondary" onclick={handleClose} disabled={loading || deleting}>
                    Zrušit
                </Button>
                <Button variant="primary" onclick={handleSubmit} disabled={loading || deleting} loading={loading}>
                    {loading ? 'Ukládání...' : 'Uložit změny'}
                </Button>
            </div>
        </div>
    {/snippet}
</Modal>