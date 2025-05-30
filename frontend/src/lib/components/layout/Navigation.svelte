<script lang="ts">
    import { AuthStore, authUser } from '$lib/stores/auth';
    import { goto } from '$app/navigation';
    import AvatarUploadModal from '../modals/AvatarUploadModal.svelte';

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

    function getAvatarSrc() {
        return $authUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent($authUser.username)}&background=6366f1&color=fff&size=40`;
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
                                <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Změnit profilový obrázek
                            </button>
                            <button
                                onclick={handleLogout}
                                class="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors duration-150"
                            >
                                <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
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
