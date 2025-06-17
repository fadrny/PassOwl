<script lang="ts">
    import { AuthStore, authUser } from '$lib/stores/auth';
    import { goto } from '$app/navigation';
    import AvatarUploadModal from '../modals/AvatarUploadModal.svelte';
    import MdHighlightOff from 'svelte-icons/md/MdHighlightOff.svelte'
    import MdPhotoFilter from 'svelte-icons/md/MdPhotoFilter.svelte'
    import MdDescription from 'svelte-icons/md/MdDescription.svelte'

    let showDropdown = $state(false);
    let showAvatarModal = $state(false);

    function handleLogout(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        showDropdown = false;
        AuthStore.logout();
        goto('/', { replaceState: true });
    }

    function toggleDropdown(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        showDropdown = !showDropdown;
    }

    function closeDropdown() {
        showDropdown = false;
    }

    function openAvatarModal(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        showAvatarModal = true;
        closeDropdown();
    }

    function handleGoToLogs(event: Event){
        event.preventDefault();
        event.stopPropagation();
        goto("dashboard/admin/logs")
        closeDropdown();
    }

    function getAvatarSrc() {
        if ($authUser.avatarUrl) {
			return $authUser.avatarUrl;
		}
		// Pokud není avatar, použijeme defaultní obrázek
		return `https://ui-avatars.com/api/?name=${encodeURIComponent($authUser.username)}&background=6366f1&color=fff&size=40`;
    }

    // Globální listener pro zavření dropdownu při kliknutí mimo
    function handleDocumentClick(event: Event) {
        const target = event.target as HTMLElement;
        const dropdown = target.closest('.avatar-dropdown');
        if (!dropdown && showDropdown) {
            showDropdown = false;
        }
    }

    // Přidání/odebrání listeneru
    $effect(() => {
        if (showDropdown) {
            document.addEventListener('click', handleDocumentClick);
        } else {
            document.removeEventListener('click', handleDocumentClick);
        }

        return () => {
            document.removeEventListener('click', handleDocumentClick);
        };
    });
</script>

<nav class="bg-white shadow">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
            <div class="flex items-center">
                <a href="/dashboard">
                    <h1 class="text-xl font-semibold">🦉 PassOwl Dashboard</h1>
                </a>
            </div>
            <div class="flex items-center space-x-4">
                <span class="text-gray-700">Vítejte, {$authUser.username}</span>
                
                <!-- Avatar dropdown -->
                <div class="relative avatar-dropdown">
                    <button
                        onclick={toggleDropdown}
                        class="flex items-center p-1 rounded-full hover:bg-gray-100 transition-colors duration-150"
                        aria-expanded={showDropdown}
                        aria-haspopup="true"
                    >
                        <img
                            src={getAvatarSrc()}
                            alt="Profilový obrázek"
                            class="w-8 h-8 rounded-full object-cover"
                        />
                    </button>

                    {#if showDropdown}
                        <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                            <button
                                onclick={openAvatarModal}
                                class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                            >
                                <div class="icon-profile"><MdPhotoFilter/></div>
                                Změnit obrázek
                            </button>
                            <button
                                onclick={handleGoToLogs}
                                class="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors duration-150"
                            >
                                <div class="icon-profile"><MdDescription/></div>
                                Logy
                            </button>
                            <button
                                onclick={handleLogout}
                                class="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors duration-150"
                            >
                                <div class="icon-logout"><MdHighlightOff/></div>
                                Odhlásit se
                            </button>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</nav>

<!-- Avatar upload modal -->
<AvatarUploadModal
    open={showAvatarModal}
    onClose={() => showAvatarModal = false}
    onAvatarUpdated={() => showAvatarModal = false}
/>
