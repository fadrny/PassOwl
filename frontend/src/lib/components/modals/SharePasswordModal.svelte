<script lang="ts">
	import Modal from './Modal.svelte';
	import Button from '../ui/Button.svelte';
	import Input from '../ui/Input.svelte';
	import ErrorMessage from '../ui/ErrorMessage.svelte';
	import { SharingManager } from '$lib/services/sharing-manager';
	import type { SharedUserResponse } from '$lib/services/api';

	interface Props {
		open: boolean;
		onClose: () => void;
		passwordId: number;
		passwordTitle: string;
		onShared?: () => void;
	}

	let { open, onClose, passwordId, passwordTitle, onShared }: Props = $props();

	let searchQuery = $state('');
	let selectedUser: { id: number; username: string } | null = $state(null);
	let searchResults: Array<{ id: number; username: string }> = $state([]);
	let sharedUsers: SharedUserResponse[] = $state([]);
	let loading = $state(false);
	let searchLoading = $state(false);
	let sharedUsersLoading = $state(false);
	let errors: string[] = $state([]);
	let searchTimeout: ReturnType<typeof setTimeout>;

	// Načtení sdílených uživatelů při otevření modálu
	$effect(() => {
		if (open && passwordId) {
			loadSharedUsers();
		}
	});

	// Debounced search
	$effect(() => {
		if (searchQuery.length >= 2) {
			clearTimeout(searchTimeout);
			searchTimeout = setTimeout(async () => {
				await searchUsers();
			}, 300);
		} else {
			searchResults = [];
		}
	});

	async function loadSharedUsers() {
		sharedUsersLoading = true;
		try {
			const result = await SharingManager.getCredentialSharedUsers(passwordId);
			if (result.error) {
				errors = [result.error.detail];
				return;
			}
			sharedUsers = result.data || [];
		} catch (err) {
			console.error('Error loading shared users:', err);
			errors = ['Chyba při načítání sdílených uživatelů'];
		} finally {
			sharedUsersLoading = false;
		}
	}

	function resetForm() {
		searchQuery = '';
		selectedUser = null;
		searchResults = [];
		sharedUsers = [];
		loading = false;
		searchLoading = false;
		sharedUsersLoading = false;
		errors = [];
	}

	function handleClose() {
		resetForm();
		onClose();
	}

	async function searchUsers() {
		if (searchQuery.length < 2) return;

		searchLoading = true;
		try {
			const result = await SharingManager.searchUsers(searchQuery);
			if (result.error) {
				errors = [result.error.detail];
				return;
			}

			// Filtruj uživatele, kteří už nemají heslo sdílené
			const sharedUserIds = new Set(sharedUsers.map((su) => su.id));
			searchResults = (result.data || []).filter((user) => !sharedUserIds.has(user.id));
		} catch (err) {
			console.error('Error searching users:', err);
			errors = ['Chyba při vyhledávání uživatelů'];
		} finally {
			searchLoading = false;
		}
	}

	function selectUser(user: { id: number; username: string }) {
		selectedUser = user;
		searchQuery = user.username;
		searchResults = [];
	}

	async function handleShare() {
		if (!selectedUser) {
			errors = ['Vyberte uživatele pro sdílení'];
			return;
		}

		loading = true;
		errors = [];

		try {
			const result = await SharingManager.sharePassword({
				credentialId: passwordId,
				recipientUserId: selectedUser.id
			});

			if (result.error) {
				errors = [result.error.detail];
				return;
			}

			// Resetuj formulář pro sdílení
			searchQuery = '';
			selectedUser = null;
			searchResults = [];

			// Znovu načti sdílené uživatele
			await loadSharedUsers();

			onShared?.();
		} catch (err) {
			console.error('Error sharing password:', err);
			errors = ['Nepodařilo se sdílet heslo'];
		} finally {
			loading = false;
		}
	}

	async function handleRemoveSharing(userId: number) {
		const confirmed = confirm('Opravdu chcete zrušit sdílení s tímto uživatelem?');
		if (!confirmed) return;

		try {
			const result = await SharingManager.removeCredentialSharing(passwordId, userId);
			if (result.error) {
				errors = [result.error.detail];
				return;
			}

			// Znovu načti sdílené uživatele
			await loadSharedUsers();
		} catch (err) {
			console.error('Error removing sharing:', err);
			errors = ['Nepodařilo se zrušit sdílení'];
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !loading) {
			event.preventDefault();
			handleShare();
		}
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('cs-CZ', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<Modal {open} onClose={handleClose} title="Sdílet heslo">
	<div class="space-y-6">
		<p class="text-sm text-gray-500">
			Správa sdílení hesla "{passwordTitle}"
		</p>

		<!-- Seznam aktuálně sdílených uživatelů -->
		<div>
			<h4 class="mb-3 text-sm font-medium text-gray-900">
				Sdíleno s uživateli ({sharedUsers.length})
			</h4>

			{#if sharedUsersLoading}
				<div class="flex items-center justify-center py-4">
					<div class="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
				</div>
			{:else if sharedUsers.length === 0}
				<div class="rounded-md bg-gray-50 py-4 text-center">
					<p class="text-sm text-gray-500">Heslo zatím není sdíleno s žádným uživatelem</p>
				</div>
			{:else}
				<div class="max-h-40 space-y-2 overflow-y-auto">
					{#each sharedUsers as sharedUser (sharedUser.id)}
						<div class="flex items-center justify-between rounded-md bg-gray-50 p-3">
							<div>
								<p class="text-sm font-medium text-gray-900">{sharedUser.username}</p>
								<p class="text-xs text-gray-500">
									Sdíleno {formatDate(sharedUser.created_at)}
								</p>
							</div>
							<Button
								variant="secondary"
								size="sm"
								onclick={() => handleRemoveSharing(sharedUser.id)}
							>
								Zrušit
							</Button>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Hranice mezi sekcemi -->
		<div class="border-t border-gray-200"></div>

		<!-- Formulář pro přidání nového sdílení -->
		<div>
			<h4 class="mb-3 text-sm font-medium text-gray-900">Sdílet s dalším uživatelem</h4>

			<div class="relative">
				<Input
					type="text"
					label="Vyhledat uživatele"
					bind:value={searchQuery}
					onkeydown={handleKeydown}
					disabled={loading}
					placeholder="Začněte psát jméno uživatele..."
				/>

				{#if searchLoading}
					<div class="absolute top-9 right-3">
						<div class="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600"></div>
					</div>
				{/if}

				<!-- Search results dropdown -->
				{#if searchResults.length > 0}
					<div
						class="ring-opacity-5 absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black focus:outline-none sm:text-sm"
					>
						{#each searchResults as user (user.id)}
							<button
								type="button"
								class="w-full cursor-pointer px-4 py-2 text-left hover:bg-gray-100"
								onclick={() => selectUser(user)}
							>
								{user.username}
							</button>
						{/each}
					</div>
				{/if}
			</div>

			{#if selectedUser}
				<div class="mt-3 rounded-md bg-blue-50 p-3">
					<p class="text-sm text-blue-800">
						<strong>Vybraný uživatel:</strong>
						{selectedUser.username}
					</p>
				</div>
			{/if}
		</div>

		{#if errors.length > 0}
			<ErrorMessage message={errors[0]} />
		{/if}
	</div>

	{#snippet footer()}
		<div class="flex justify-between">
			<Button variant="secondary" onclick={handleClose} disabled={loading}>Zavřít</Button>

			<div class="flex space-x-3">
				{#if selectedUser}
					<Button variant="primary" onclick={handleShare} disabled={loading} {loading}>
						Sdílet s uživatelem
					</Button>
				{/if}
			</div>
		</div>
	{/snippet}
</Modal>
