<script lang="ts">
    import Button from '$lib/components/ui/Button.svelte';

    interface PasswordEntry {
        id: string;
        name: string;
        username: string;
        encryptedPassword: string;
        decryptedPassword?: string;
        url?: string | null;
        category?: {
            id: string;
            name: string;
            color: string;
        };
        created_at?: string;
        updated_at?: string;
    }

    interface Props {
        passwords: PasswordEntry[];
        onDecrypt?: (id: string) => void;
        onEdit?: (id: string) => void;
        onShare?: (id: string) => void;
    }

    let { passwords = [], onDecrypt, onEdit, onShare }: Props = $props();

    // Stav pro sledování, které heslo je dešifrované - použití $derived
    const decryptedPasswordIds = $derived(
        new Set(
            passwords
                .filter(p => p.decryptedPassword !== undefined)
                .map(p => p.id)
        )
    );

    function handleDecrypt(id: string) {
        onDecrypt?.(id);
    }

    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text).then(() => {
            // Můžete přidat toast notifikaci
            console.log('Zkopírováno do schránky');
        }).catch(err => {
            console.error('Chyba při kopírování:', err);
        });
    }

    function formatDate(dateString?: string): string {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('cs-CZ');
    }
</script>

<div class="bg-white shadow overflow-hidden sm:rounded-md">
    {#if passwords.length === 0}
        <div class="text-center py-12">
            <svg
                class="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Žádná hesla</h3>
            <p class="mt-1 text-sm text-gray-500">Začněte přidáním prvního hesla.</p>
        </div>
    {:else}
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th
                            scope="col"
                            class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        >
                            Název
                        </th>
                        <th
                            scope="col"
                            class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        >
                            Uživatelské jméno
                        </th>
                        <th
                            scope="col"
                            class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        >
                            Heslo
                        </th>
                        <th
                            scope="col"
                            class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        >
                            Kategorie
                        </th>
                        <th
                            scope="col"
                            class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                        >
                            Vytvořeno
                        </th>
                        <th scope="col" class="relative px-6 py-3">
                            <span class="sr-only">Akce</span>
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    {#each passwords as password (password.id)}
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <div class="text-sm font-medium text-gray-900">
                                        {password.name}
                                    </div>
                                    {#if password.url}
                                        <a href={password.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            class="ml-2 text-indigo-600 hover:text-indigo-500"
                                            title="Otevřít URL"
                                            aria-label="Odkaz na web"
                                        >
                                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    stroke-width="2"
                                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M7 7l10 10M17 7v4"
                                                />
                                            </svg>
                                        </a>
                                    {/if}
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center space-x-2">
                                    <span class="text-sm text-gray-900">{password.username}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onclick={() => copyToClipboard(password.username)}
                                    >
                                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                            />
                                        </svg>
                                    </Button>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center space-x-2">
                                    {#if decryptedPasswordIds.has(password.id)}
                                        <code class="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                            {password.decryptedPassword}
                                        </code>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onclick={() => copyToClipboard(password.decryptedPassword || '')}
                                        >
                                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    stroke-width="2"
                                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                                />
                                            </svg>
                                        </Button>
                                    {:else}
                                        <span class="text-sm text-gray-500">••••••••</span>
                                    {/if}
                                    
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onclick={() => handleDecrypt(password.id)}
                                    >
                                        {#if decryptedPasswordIds.has(password.id)}
                                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    stroke-width="2"
                                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                                                />
                                            </svg>
                                        {:else}
                                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    stroke-width="2"
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                                <path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    stroke-width="2"
                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                />
                                            </svg>
                                        {/if}
                                    </Button>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                {#if password.category}
                                    <span
                                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                        style="background-color: {password.category.color}20; color: {password.category.color}"
                                    >
                                        {password.category.name}
                                    </span>
                                {:else}
                                    <span class="text-sm text-gray-500">-</span>
                                {/if}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(password.created_at)}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div class="flex items-center space-x-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onclick={() => onEdit?.(password.id)}
                                    >
                                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                            />
                                        </svg>
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onclick={() => onShare?.(password.id)}
                                    >
                                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                                            />
                                        </svg>
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>
