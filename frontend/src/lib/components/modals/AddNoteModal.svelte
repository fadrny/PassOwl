<script lang="ts">
    import Modal from './Modal.svelte';
    import Input from '$lib/components/ui/Input.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import ErrorMessage from '$lib/components/ui/ErrorMessage.svelte';
    import { NotesManager, type NoteCreateData } from '$lib/services/notes-manager';

    interface Props {
        open: boolean;
        onClose: () => void;
        onNoteAdded?: () => void;
    }

    let { open, onClose, onNoteAdded }: Props = $props();

    let formData: NoteCreateData = $state({
        title: '',
        content: ''
    });

    let loading = $state(false);
    let errors: string[] = $state([]);

    // Reset form when modal opens
    $effect(() => {
        if (open) {
            formData = {
                title: '',
                content: ''
            };
            errors = [];
        }
    });

    function handleClose() {
        formData = {
            title: '',
            content: ''
        };
        loading = false;
        errors = [];
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
        if (!validateForm()) return;

        if (!NotesManager.isEncryptionKeyAvailable()) {
            errors = ['Šifrovací klíč není dostupný. Obnovte stránku a přihlaste se znovu.'];
            return;
        }

        loading = true;
        errors = [];

        try {
            const result = await NotesManager.createNote(formData);

            if (result.error) {
                errors = [result.error.detail];
                return;
            }

            onNoteAdded?.();
            handleClose();
        } catch (err) {
            console.error('Error creating note:', err);
            errors = ['Nastala neočekávaná chyba při vytváření poznámky'];
        } finally {
            loading = false;
        }
    }
</script>

<Modal {open} onClose={handleClose} title="Přidat novou poznámku">
    {#snippet children()}
        <form
            class="space-y-4"
            onsubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }}
        >
            <Input
                type="text"
                name="title"
                id="title"
                label="Název *"
                placeholder="Název poznámky"
                required
                bind:value={formData.title}
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
                    disabled={loading}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                ></textarea>
            </div>

            {#if errors.length > 0}
                <ErrorMessage message={errors[0]} />
            {/if}
        </form>
    {/snippet}

    {#snippet footer()}
        <div class="flex space-x-3">
            <Button variant="secondary" onclick={handleClose} disabled={loading}>
                Zrušit
            </Button>
            <Button variant="primary" onclick={handleSubmit} disabled={loading} loading={loading}>
                {loading ? 'Vytváření...' : 'Vytvořit poznámku'}
            </Button>
        </div>
    {/snippet}
</Modal>