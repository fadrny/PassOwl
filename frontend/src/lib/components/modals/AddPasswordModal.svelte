<script lang="ts">
    import { PasswordManager } from '$lib/services/password-manager';
    import type { PasswordCreateData } from '$lib/services/password-manager';
    import Modal from '$lib/components/ui/Modal.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Input from '$lib/components/ui/Input.svelte';
    import ErrorMessage from '$lib/components/ui/ErrorMessage.svelte';
    import CategorySelect from '$lib/components/ui/CategorySelect.svelte';

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

    function handleCategoryChange(selectedIds: number[]) {
        formData.categoryIds = selectedIds;
    }

    async function handleSubmit() {
        if (!validateForm()) return;

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

            onPasswordAdded?.();
            handleClose();
        } catch (err) {
            console.error('Error creating password:', err);
            errors = ['Nastala neočekávaná chyba při vytváření hesla'];
        } finally {
            loading = false;
        }
    }
</script>

<Modal {open} onClose={handleClose} title="Přidat nové heslo">
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

            <CategorySelect
                selectedIds={formData.categoryIds}
                onSelectionChange={handleCategoryChange}
                disabled={loading}
            />

            {#if errors.length > 0}
                <ErrorMessage message={errors[0]} />
            {/if}
        </form>
    {/snippet}

    {#snippet footer()}
        <div class="flex justify-end space-x-3">
            <Button
                type="button"
                variant="secondary"
                onclick={handleClose}
                disabled={loading}
            >
                Zrušit
            </Button>
            <Button
                type="button"
                variant="primary"
                disabled={loading}
                loading={loading}
                onclick={handleSubmit}
            >
                {loading ? 'Přidávání...' : 'Přidat heslo'}
            </Button>
        </div>
    {/snippet}
</Modal>