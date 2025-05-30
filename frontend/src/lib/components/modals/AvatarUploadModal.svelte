<script lang="ts">
    import Modal from './Modal.svelte';
    import Button from '../ui/Button.svelte';
    import ErrorMessage from '../ui/ErrorMessage.svelte';
    import { AuthStore } from '$lib/stores/auth';
    import { api } from '$lib/services/api-client';

    interface Props {
        open: boolean;
        onClose: () => void;
        onAvatarUpdated?: () => void;
    }

    let { open, onClose, onAvatarUpdated }: Props = $props();

    let fileInput: HTMLInputElement;
    let selectedFile: File | null = $state(null);
    let previewUrl: string | null = $state(null);
    let loading = $state(false);
    let errors: string[] = $state([]);

    function handleFileSelect(event: Event) {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        
        if (!file) return;

        // Validace
        if (!file.type.startsWith('image/')) {
            errors = ['Povoleny jsou pouze obrázky'];
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            errors = ['Obrázek je příliš velký (max 5MB)'];
            return;
        }

        selectedFile = file;
        errors = [];

        // Vytvoření náhledu
        const reader = new FileReader();
        reader.onload = (e) => {
            previewUrl = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    }

    function handleClose() {
        selectedFile = null;
        previewUrl = null;
        errors = [];
        loading = false;
        onClose();
    }

    async function handleUpload() {
        if (!selectedFile) return;

        loading = true;
        errors = [];

        try {
            // 1. Nahrání do Cloudinary
            const formData = new FormData();
            formData.append('avatar', selectedFile);

            const uploadResponse = await fetch('/api/upload-avatar', {
                method: 'POST',
                body: formData
            });

            const uploadResult = await uploadResponse.json();

            if (!uploadResponse.ok) {
                errors = [uploadResult.error || 'Chyba při nahrávání'];
                return;
            }

            // 2. Aktualizace URL v databázi přes FastAPI
            try {
                const updateResponse = await api.users.updateUserAvatarUsersMeAvatarPut({
                    avatar_url: uploadResult.url
                });

                // 3. Aktualizace avatar URL v local store
                AuthStore.updateAvatarUrl(uploadResult.url);
                
                console.log('Avatar byl úspěšně aktualizován:', uploadResult.url);
                
                onAvatarUpdated?.();
                handleClose();
            } catch (apiError) {
                console.error('Chyba při aktualizaci avatar URL v databázi:', apiError);
                errors = ['Obrázek byl nahrán, ale nepodařilo se aktualizovat profil'];
                
                // I přes chybu aktualizujeme local store, protože obrázek byl nahrán
                AuthStore.updateAvatarUrl(uploadResult.url);
            }

        } catch (err) {
            console.error('Upload error:', err);
            errors = ['Nastala neočekávaná chyba při nahrávání'];
        } finally {
            loading = false;
        }
    }
</script>

<Modal {open} onClose={handleClose} title="Změnit profilový obrázek">
    {#snippet children()}
        <div class="space-y-4">
            <!-- File input -->
            <div>
                <label for="avatar-file-input" class="block text-sm font-medium text-gray-700 mb-2">
                    Vyberte obrázek
                </label>
                <input
                    id="avatar-file-input"
                    type="file"
                    accept="image/*"
                    bind:this={fileInput}
                    onchange={handleFileSelect}
                    class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <p class="mt-1 text-xs text-gray-500">
                    PNG, JPG, GIF až do 5MB. Doporučené rozlišení: 200x200px
                </p>
            </div>

            <!-- Preview -->
            {#if previewUrl}
                <div class="flex justify-center">
                    <div class="relative">
                        <img
                            src={previewUrl}
                            alt="Náhled avatara"
                            class="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                        />
                    </div>
                </div>
            {/if}

            {#if errors.length > 0}
                <ErrorMessage message={errors[0]} />
            {/if}
        </div>
    {/snippet}

    {#snippet footer()}
        <div class="flex space-x-3 justify-end">
            <Button variant="secondary" onclick={handleClose} disabled={loading}>
                Zrušit
            </Button>
            <Button 
                variant="primary" 
                onclick={handleUpload} 
                disabled={!selectedFile || loading} 
                loading={loading}
            >
                {loading ? 'Nahrávání...' : 'Nahrát obrázek'}
            </Button>
        </div>
    {/snippet}
</Modal>