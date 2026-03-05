<script lang="ts">
	import { onMount } from 'svelte';
	import { PasswordManager, type PasswordUpdateData } from '$lib/services/password-manager';
	import { CategoryManager } from '$lib/services/category-manager';
	import { SharingManager } from '$lib/services/sharing-manager';
	import type { Credential, PasswordCategory, SharedCredentialResponse } from '$lib/services/api';
	import type { DecryptedSharedPassword } from '$lib/services/sharing-manager';
	import PasswordTable from '$lib/components/tables/PasswordTable.svelte';
	import SharedPasswordTable from '$lib/components/tables/SharedPasswordTable.svelte';
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import ErrorMessage from '$lib/components/ui/ErrorMessage.svelte';
	import AddPasswordModal from '$lib/components/modals/AddPasswordModal.svelte';
	import EditPasswordModal from '$lib/components/modals/EditPasswordModal.svelte';
	import SharePasswordModal from '$lib/components/modals/SharePasswordModal.svelte';

	interface VisiblePasswordState {
		password: string;
		encryptedData: string;
		encryptionIv: string;
	}

	interface PasswordUpdatedPayload {
		credential: Credential;
		password?: string;
	}

	let passwords: Credential[] = $state([]);
	let categories: PasswordCategory[] = $state([]);
	let decryptedPasswords = $state(new Map<number, VisiblePasswordState>());
	let pendingUpdatedPassword: (VisiblePasswordState & { id: number }) | null = $state(null);
	let loading = $state(true);
	let error: string | null = $state(null);
	let showAddModal = $state(false);
	let showEditModal = $state(false);
	let editingPasswordId: number | undefined = $state(undefined);
	let editingPasswordData: PasswordUpdateData | undefined = $state(undefined);

	let currentPage = $state(1);
	let totalPages = $state(1);
	let totalCount = $state(0);
	const pageSize = 10;

	let currentSort = $state({ by: '', direction: 'asc' });
	let currentCategoryFilter: number | null = $state(null);

	let sharedPasswords: SharedCredentialResponse[] = $state([]);
	let decryptedSharedPasswords = $state(new Map<number, DecryptedSharedPassword>());
	let showShareModal = $state(false);
	let sharePasswordId = $state(0);
	let sharePasswordTitle = $state('');

	let sharedCurrentPage = $state(1);
	let sharedTotalPages = $state(1);
	let sharedTotalCount = $state(0);
	let sharedLoading = $state(false);

	onMount(async () => {
		await Promise.all([loadPasswords(), loadCategories(), loadSharedPasswords()]);
	});

	async function loadCategories() {
		try {
			const result = await CategoryManager.getCategories();
			if (result.data) {
				categories = result.data;
			}
		} catch (err) {
			console.error('Error loading categories:', err);
		}
	}

	async function loadPasswords() {
		loading = true;
		error = null;

		try {
			const skip = (currentPage - 1) * pageSize;
			const params: {
				skip: number;
				limit: number;
				sort_by?: string;
				sort_direction?: string;
				filter_category?: number | null;
			} = {
				skip,
				limit: pageSize
			};

			if (currentSort.by) {
				params.sort_by = currentSort.by;
				params.sort_direction = currentSort.direction;
			}

			if (currentCategoryFilter !== null) {
				params.filter_category = currentCategoryFilter;
			}

			const result = await PasswordManager.getPasswords(params);

			if (result.error) {
				error = result.error.detail;
				return;
			}

			const nextPasswords = result.data?.items || [];
			const nextDecryptedPasswords = new Map<number, VisiblePasswordState>();

			for (const password of nextPasswords) {
				const decrypted = decryptedPasswords.get(password.id);
				if (
					decrypted &&
					decrypted.encryptedData === password.encrypted_data &&
					decrypted.encryptionIv === password.encryption_iv
				) {
					nextDecryptedPasswords.set(password.id, decrypted);
				}
			}

			if (pendingUpdatedPassword) {
				const updatedPassword = nextPasswords.find(
					(password) => password.id === pendingUpdatedPassword?.id
				);

				if (
					updatedPassword &&
					updatedPassword.encrypted_data === pendingUpdatedPassword.encryptedData &&
					updatedPassword.encryption_iv === pendingUpdatedPassword.encryptionIv
				) {
					nextDecryptedPasswords.set(updatedPassword.id, {
						password: pendingUpdatedPassword.password,
						encryptedData: pendingUpdatedPassword.encryptedData,
						encryptionIv: pendingUpdatedPassword.encryptionIv
					});
				}

				pendingUpdatedPassword = null;
			}

			passwords = nextPasswords;
			totalCount = result.data?.total || 0;
			totalPages = Math.ceil(totalCount / pageSize);
			decryptedPasswords = nextDecryptedPasswords;
		} catch (err) {
			console.error('Error loading passwords:', err);
			error = 'Nepodařilo se načíst hesla';
		} finally {
			loading = false;
		}
	}

	async function loadSharedPasswords() {
		sharedLoading = true;
		try {
			const skip = (sharedCurrentPage - 1) * pageSize;
			const result = await SharingManager.getSharedPasswords({ skip, limit: pageSize });

			if (result.error) {
				console.error('Error loading shared passwords:', result.error);
				return;
			}

			sharedPasswords = result.data?.items || [];
			sharedTotalCount = result.data?.total || 0;
			sharedTotalPages = Math.ceil(sharedTotalCount / pageSize);
			decryptedSharedPasswords.clear();
			decryptedSharedPasswords = new Map(decryptedSharedPasswords);
		} catch (err) {
			console.error('Error loading shared passwords:', err);
		} finally {
			sharedLoading = false;
		}
	}

	const transformedPasswords = $derived(
		passwords.map((password) => {
			const decrypted = decryptedPasswords.get(password.id);
			return {
				id: password.id.toString(),
				name: password.title,
				username: password.username,
				encryptedPassword: password.encrypted_data,
				decryptedPassword: decrypted?.password,
				url: password.url || undefined,
				category: password.categories?.[0]
					? {
							id: password.categories[0].id.toString(),
							name: password.categories[0].name,
							color: password.categories[0].color_hex || '#6B7280'
						}
					: undefined,
				created_at: password.created_at,
				updated_at: password.updated_at
			};
		})
	);

	async function handleDecrypt(passwordId: string) {
		const id = parseInt(passwordId, 10);
		const password = passwords.find((item) => item.id === id);

		if (!password) return;

		if (decryptedPasswords.has(id)) {
			decryptedPasswords.delete(id);
			decryptedPasswords = new Map(decryptedPasswords);
			return;
		}

		try {
			const result = await PasswordManager.decryptPassword(password);

			if (result.error) {
				alert(`Chyba při dešifrování: ${result.error.detail}`);
				return;
			}

			if (result.data) {
				decryptedPasswords.set(id, {
					password: result.data.password,
					encryptedData: password.encrypted_data,
					encryptionIv: password.encryption_iv
				});
				decryptedPasswords = new Map(decryptedPasswords);
			}
		} catch (err) {
			console.error('Error decrypting password:', err);
			alert('Nepodařilo se dešifrovat heslo');
		}
	}

	async function handleDecryptShared(sharedId: number) {
		const sharedCredential = sharedPasswords.find((item) => item.id === sharedId);
		if (!sharedCredential) return;

		if (decryptedSharedPasswords.has(sharedId)) {
			decryptedSharedPasswords.delete(sharedId);
			decryptedSharedPasswords = new Map(decryptedSharedPasswords);
			return;
		}

		try {
			const result = await SharingManager.decryptSharedPassword(sharedCredential);

			if (result.error) {
				alert(`Chyba při dešifrování: ${result.error.detail}`);
				return;
			}

			if (result.data) {
				decryptedSharedPasswords.set(sharedId, result.data);
				decryptedSharedPasswords = new Map(decryptedSharedPasswords);
			}
		} catch (err) {
			console.error('Error decrypting shared password:', err);
			alert('Nepodařilo se dešifrovat sdílené heslo');
		}
	}

	function handleSortChange(sortBy: string, direction: string) {
		currentSort = { by: sortBy, direction };
		currentPage = 1;
		loadPasswords();
	}

	function handleCategoryFilter(categoryId: number | null) {
		currentCategoryFilter = categoryId;
		currentPage = 1;
		loadPasswords();
	}

	function handlePageChange(page: number) {
		currentPage = page;
		loadPasswords();
	}

	function handleSharedPageChange(page: number) {
		sharedCurrentPage = page;
		loadSharedPasswords();
	}

	function handleEdit(id: string) {
		const passwordId = parseInt(id, 10);
		const password = passwords.find((item) => item.id === passwordId);

		if (password) {
			editingPasswordId = passwordId;
			editingPasswordData = {
				title: password.title,
				username: password.username,
				password: '',
				url: password.url,
				categoryIds: password.categories?.map((category) => category.id) || []
			};
			showEditModal = true;
		}
	}

	function handleShare(id: string) {
		const passwordId = parseInt(id, 10);
		const password = passwords.find((item) => item.id === passwordId);

		if (password) {
			sharePasswordId = passwordId;
			sharePasswordTitle = password.title;
			showShareModal = true;
		}
	}

	function handlePasswordAdded() {
		loadPasswords();
		showAddModal = false;
	}

	function handlePasswordUpdated(payload?: PasswordUpdatedPayload) {
		if (payload?.password) {
			pendingUpdatedPassword = {
				id: payload.credential.id,
				password: payload.password,
				encryptedData: payload.credential.encrypted_data,
				encryptionIv: payload.credential.encryption_iv
			};
		}

		loadPasswords();
		showEditModal = false;
	}

	function handlePasswordDeleted() {
		loadPasswords();
		showEditModal = false;
	}

	function handlePasswordShared() {
		showShareModal = false;
		loadSharedPasswords();
	}
</script>

<svelte:head>
	<title>Hesla - PassOwl</title>
</svelte:head>

<div class="space-y-6">
	<PageHeader
		title="Hesla"
		description="Spravujte svá hesla bezpečně a na jednom místě."
		buttonText="Přidat nové heslo"
		onButtonClick={() => (showAddModal = true)}
	/>

	{#if error}
		<ErrorMessage message={error} />
	{/if}

	<PasswordTable
		passwords={transformedPasswords}
		{categories}
		{loading}
		{currentPage}
		{totalPages}
		{totalCount}
		onDecrypt={handleDecrypt}
		onEdit={handleEdit}
		onShare={handleShare}
		onSortChange={handleSortChange}
		onCategoryFilter={handleCategoryFilter}
		onPageChange={handlePageChange}
		{currentSort}
		{currentCategoryFilter}
	/>

	<SharedPasswordTable
		{sharedPasswords}
		{decryptedSharedPasswords}
		currentPage={sharedCurrentPage}
		totalPages={sharedTotalPages}
		totalCount={sharedTotalCount}
		loading={sharedLoading}
		onDecrypt={handleDecryptShared}
		onPageChange={handleSharedPageChange}
	/>
</div>

<AddPasswordModal
	open={showAddModal}
	onClose={() => (showAddModal = false)}
	{categories}
	onPasswordAdded={handlePasswordAdded}
/>

<EditPasswordModal
	open={showEditModal}
	onClose={() => (showEditModal = false)}
	passwordId={editingPasswordId}
	initialData={editingPasswordData}
	{categories}
	onPasswordUpdated={handlePasswordUpdated}
	onPasswordDeleted={handlePasswordDeleted}
/>

<SharePasswordModal
	open={showShareModal}
	onClose={() => (showShareModal = false)}
	passwordId={sharePasswordId}
	passwordTitle={sharePasswordTitle}
	onShared={handlePasswordShared}
/>
