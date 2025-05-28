<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';

	interface PasswordEntry {
		id: string;
		name: string;
		username: string;
		encryptedPassword: string;
		category?: {
			id: string;
			name: string;
			color: string;
		};
		decryptedPassword?: string;
	}

	interface Props {
		passwords: PasswordEntry[];
		onDecrypt?: (id: string) => void;
		onEdit?: (id: string) => void;
		onShare?: (id: string) => void;
	}

	let { passwords = [], onDecrypt, onEdit, onShare }: Props = $props();

	// Stav pro sledování, které heslo je dešifrované
	let decryptedPasswords = $state(new Set<string>());

	function handleDecrypt(id: string) {
		if (decryptedPasswords.has(id)) {
			// Skrýt heslo
			decryptedPasswords.delete(id);
			decryptedPasswords = new Set(decryptedPasswords);
		} else {
			// Dešifrovat heslo
			onDecrypt?.(id);
			decryptedPasswords.add(id);
			decryptedPasswords = new Set(decryptedPasswords);
		}
	}

	function getCategoryColorClasses(color: string) {
		const colorMap: Record<string, string> = {
			blue: 'bg-blue-100 text-blue-800',
			green: 'bg-green-100 text-green-800',
			yellow: 'bg-yellow-100 text-yellow-800',
			red: 'bg-red-100 text-red-800',
			purple: 'bg-purple-100 text-purple-800',
			gray: 'bg-gray-100 text-gray-800',
			indigo: 'bg-indigo-100 text-indigo-800',
			pink: 'bg-pink-100 text-pink-800'
		};
		return colorMap[color] || 'bg-gray-100 text-gray-800';
	}
</script>

<div class="overflow-hidden bg-white shadow sm:rounded-md">
	{#if passwords.length === 0}
		<div class="py-12 text-center">
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
				<thead class="bg-gray-200">
					<tr>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-800"
						>
							Název
						</th>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-800"
						>
							Uživatelské jméno
						</th>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-800"
						>
							Heslo
						</th>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-800"
						>
							Kategorie
						</th>
						<th
							scope="col"
							class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-800"
						>
							Akce
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 bg-white">
					{#each passwords as password (password.id)}
						<tr class="hover:bg-gray-50">
							<td class="whitespace-nowrap px-6 py-4">
								<div class="flex items-center">
									<div class="h-8 w-8 flex-shrink-0">
										<div
											class="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100"
										>
											<svg
												class="h-4 w-4 text-indigo-600"
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
										</div>
									</div>
									<div class="ml-4">
										<div class="text-sm font-medium text-gray-900">
											{password.name}
										</div>
									</div>
								</div>
							</td>
							<td class="whitespace-nowrap px-6 py-4">
								<div class="text-sm text-gray-500">
									{password.username}
								</div>
							</td><td class="whitespace-nowrap px-6 py-4">
								<div class="flex items-center space-x-2">
									{#if decryptedPasswords.has(password.id)}
										<span class="font-mono text-sm text-gray-900">
											{password.decryptedPassword || '••••••••'}
										</span>
									{:else}
										<span class="font-mono text-sm text-gray-500"> •••••••• </span>
									{/if}
								</div>
							</td>
							<td class="whitespace-nowrap px-6 py-4">
								{#if password.category}
									<span
										class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getCategoryColorClasses(
											password.category.color
										)}"
									>
										{password.category.name}
									</span>
								{/if}
							</td>
							<td class="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
								<div class="flex justify-end space-x-2">
									<Button
										variant="ghost"
										size="sm"
										onclick={() => handleDecrypt(password.id)}
										title={decryptedPasswords.has(password.id) ? 'Skrýt heslo' : 'Zobrazit heslo'}
									>
										{#if decryptedPasswords.has(password.id)}
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

									<Button
										variant="ghost"
										size="sm"
										onclick={() => onEdit?.(password.id)}
										title="Upravit heslo"
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
										title="Sdílet heslo"
									>
										<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
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
