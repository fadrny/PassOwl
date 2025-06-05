<script lang="ts">
    import Button from '../ui/Button.svelte';
    import type { SharedCredentialResponse } from '$lib/services/api';
    import type { DecryptedSharedPassword } from '$lib/services/sharing-manager';

    interface Props {
        sharedPasswords: SharedCredentialResponse[];
        decryptedSharedPasswords: Map<number, DecryptedSharedPassword>;
        onDecrypt: (id: number) => void;
    }

    let { sharedPasswords, decryptedSharedPasswords, onDecrypt }: Props = $props();

    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Zkopírováno do schránky');
        }).catch(err => {
            console.error('Chyba při kopírování:', err);
        });
    }

    function formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString('cs-CZ');
    }
</script>

<div class="bg-white shadow overflow-hidden sm:rounded-md">
    <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 class="text-lg leading-6 font-medium text-gray-900">
            Sdílená hesla ({sharedPasswords.length})
        </h3>
        <p class="mt-1 text-sm text-gray-500">
            Hesla, která s vámi sdíleli ostatní uživatelé
        </p>
    </div>

    {#if sharedPasswords.length === 0}
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
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Žádná sdílená hesla</h3>
            <p class="mt-1 text-sm text-gray-500">
                Zatím s vámi nikdo nesdílel žádná hesla.
            </p>
        </div>
    {:else}
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Název
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vlastník
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Uživatelské jméno
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Heslo
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sdíleno
                        </th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Akce
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    {#each sharedPasswords as sharedPassword}
                        {@const decrypted = decryptedSharedPasswords.get(sharedPassword.id)}
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-gray-900">
                                    {decrypted?.title || sharedPassword.credential_title}
                                </div>
                                {#if decrypted?.url}
                                    <div class="text-sm text-gray-500">
                                        <a href={decrypted.url} target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800">
                                            {decrypted.url}
                                        </a>
                                    </div>
                                {/if}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {sharedPassword.owner_username}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {#if decrypted}
                                    <div class="flex items-center gap-2">
                                        <span class="font-mono">{decrypted.username}</span>
                                        <button
                                            type="button"
                                            onclick={() => copyToClipboard(decrypted.username)}
                                            class="text-gray-400 hover:text-gray-600"
                                            title="Kopírovat uživatelské jméno"
                                        >
                                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                    </div>
                                {:else}
                                    <span class="text-gray-400">•••••••••</span>
                                {/if}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {#if decrypted}
                                    <div class="flex items-center gap-2">
                                        <span class="font-mono">••••••••••</span>
                                        <button
                                            type="button"
                                            onclick={() => copyToClipboard(decrypted.password)}
                                            class="text-gray-400 hover:text-gray-600"
                                            title="Kopírovat heslo"
                                        >
                                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                    </div>
                                {:else}
                                    <span class="text-gray-400">•••••••••</span>
                                {/if}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(sharedPassword.created_at)}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {#if decrypted}
                                    <span class="text-green-600 text-sm">Dešifrováno</span>
                                {:else}
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onclick={() => onDecrypt(sharedPassword.id)}
                                    >
                                        Dešifrovat
                                    </Button>
                                {/if}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>