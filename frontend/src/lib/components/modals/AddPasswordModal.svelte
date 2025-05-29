<script lang="ts">
    import { PasswordManager } from '$lib/services/password-manager';
    import type { PasswordCreateData } from '$lib/services/password-manager';
    import Button from '$lib/components/ui/Button.svelte';
    import Input from '$lib/components/ui/Input.svelte';
    import ErrorMessage from '$lib/components/ui/ErrorMessage.svelte';

    interface Props {
        open: boolean;
        onClose: () => void;
        onPasswordAdded?: () => void;
    }

    let { open, onClose, onPasswordAdded }: Props = $props();

    let loading = $state(false);
    let errors: string[] = $state([]);

    let formData: PasswordCreateData = $state({
        title: '',
        username: '',
        password: '',
        url: '',
        categoryIds: []
    });

    function resetForm() {
        formData = {
            title: '',
            username: '',
            password: '',
            url: '',
            categoryIds: []
        };
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

        if (!formData.username.trim()) {
            errors.push('Uživatelské jméno je povinné');
        }

        if (!formData.password.trim()) {
            errors.push('Heslo je povinné');
        }

        return errors.length === 0;
    }

    function generatePassword() {
        const length = 16;
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=';
        let password = '';
        
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        
        formData.password = password;
    }

    async function handleSubmit() {
        if (!validateForm()) return;

        // Kontrola dostupnosti šifrovacího klíče
        if (!PasswordManager.isEncryptionKeyAvailable()) {
            errors = ['Šifrovací klíč není dostupný. Obnovte stránku a přihlaste se znovu.'];
            return;
        }

        loading = true;
        errors = [];

        try {
            const result = await PasswordManager.createPassword(formData);

            if (result.error) {
                errors = [result.error.detail];
                return;
            }

            // Úspěch - zavřít modal a signalizovat přidání
            onPasswordAdded?.();
            handleClose();
        } catch (err) {
            console.error('Error creating password:', err);
            errors = ['Nastala neočekávaná chyba při vytváření hesla'];
        } finally {
            loading = false;
        }
    }

    // Zavření modalu při kliku mimo obsah
    function handleBackdropClick(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            handleClose();
        }
    }

    // Zavření modalu při stisknutí Escape
    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            handleClose();
        }
    }

    function handleBackdropKeydown(event: KeyboardEvent) {
        // Close on Enter or Space if the backdrop itself is the target
        if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault(); // Prevent default browser action for space/enter
            handleClose();
        }
    }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
    <!-- Backdrop -->
    <div
        class="fixed inset-0 backdrop-blur flex items-center justify-center p-4 z-50"
        onclick={handleBackdropClick}
        onkeydown={handleBackdropKeydown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabindex="-1"
    >
        <!-- Modal Content -->
        <div
            class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onclick={(e) => e.stopPropagation()}
            onkeydown={(e) => e.stopPropagation()}
            role="presentation"
        >
            <!-- Header -->
            <div class="px-6 py-4 border-b border-gray-200">
                <div class="flex items-center justify-between">
                    <h2 id="modal-title" class="text-lg font-semibold text-gray-900">
                        Přidat nové heslo
                    </h2>
                    <button
                        type="button"
                        class="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                        onclick={handleClose}
                        aria-label="Zavřít"
                    >
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Body -->
            <form
                class="px-6 py-4 space-y-4"
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
                    placeholder="např. Gmail, GitHub..."
                    required
                    bind:value={formData.title}
                />

                <Input
                    type="text"
                    name="username"
                    id="username"
                    label="Uživatelské jméno *"
                    placeholder="email nebo login"
                    required
                    bind:value={formData.username}
                />

                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <label for="password" class="block text-sm font-medium text-gray-700">
                            Heslo *
                        </label>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onclick={generatePassword}
                        >
                            Generovat
                        </Button>
                    </div>
                    <Input
                        type="password"
                        name="password"
                        id="password"
                        placeholder="Zadejte heslo"
                        required
                        bind:value={formData.password}
                    />
                </div>

                <Input
                    type="url"
                    name="url"
                    id="url"
                    label="URL"
                    placeholder="https://..."
                    bind:value={formData.url}
                />

                {#if errors.length > 0}
                    <ErrorMessage message={errors[0]} />
                {/if}

                <!-- Footer -->
                <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <Button
                        type="button"
                        variant="secondary"
                        onclick={handleClose}
                        disabled={loading}
                    >
                        Zrušit
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={loading}
                        loading={loading}
                    >
                        {loading ? 'Přidávání...' : 'Přidat heslo'}
                    </Button>
                </div>
            </form>
        </div>
    </div>
{/if}