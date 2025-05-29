<script lang="ts">
    import type { Snippet } from 'svelte';

    interface Props {
        open: boolean;
        onClose: () => void;
        title?: string;
        size?: 'sm' | 'md' | 'lg' | 'xl';
        closeOnBackdrop?: boolean;
        closeOnEscape?: boolean;
        showCloseButton?: boolean;
        children: Snippet;
        footer?: Snippet;
    }

    let { 
        open, 
        onClose, 
        title, 
        size = 'md',
        closeOnBackdrop = true,
        closeOnEscape = true,
        showCloseButton = true,
        children,
        footer
    }: Props = $props();

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl'
    };

    function handleBackdropClick(event: MouseEvent) {
        if (closeOnBackdrop && event.target === event.currentTarget) {
            onClose();
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (closeOnEscape && event.key === 'Escape') {
            onClose();
        }
    }

    function handleBackdropKeydown(event: KeyboardEvent) {
        if (closeOnBackdrop && event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            onClose();
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
        aria-labelledby={title ? "modal-title" : undefined}
        tabindex="-1"
    >
        <!-- Modal Content -->
        <div
            class="bg-white rounded-lg shadow-xl {sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto"
            onclick={(e) => e.stopPropagation()}
            onkeydown={(e) => e.stopPropagation()}
            role="presentation"
        >
            <!-- Header -->
            {#if title || showCloseButton}
                <div class="px-6 py-4 border-b border-gray-200">
                    <div class="flex items-center justify-between">
                        {#if title}
                            <h2 id="modal-title" class="text-lg font-semibold text-gray-900">
                                {title}
                            </h2>
                        {/if}
                        {#if showCloseButton}
                            <button
                                type="button"
                                class="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                                onclick={onClose}
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
                        {/if}
                    </div>
                </div>
            {/if}

            <!-- Body -->
            <div class="px-6 py-4">
                {@render children()}
            </div>

            <!-- Footer (optional) -->
            {#if footer}
                <div class="px-6 py-4 border-t border-gray-200">
                    {@render footer()}
                </div>
            {/if}
        </div>
    </div>
{/if}