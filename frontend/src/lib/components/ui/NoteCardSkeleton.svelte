<script lang="ts">
    interface Props {
        variant?: 'short' | 'medium' | 'long';
        pulse?: boolean;
    }

    let { variant = 'medium', pulse = false }: Props = $props();

    const heights = {
        short: 'h-24',
        medium: 'h-32', 
        long: 'h-40'
    };

    const contentLines = {
        short: 2,
        medium: 3,
        long: 4
    };

    const pulseClass = pulse ? 'animate-pulse' : '';
</script>

<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 break-inside-avoid mb-4 {pulseClass}">
    <!-- Header placeholder -->
    <div class="mb-3">
        <div class="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
    </div>
    
    <!-- Content placeholder -->
    <div class="mb-4 space-y-2">
        {#each Array(contentLines[variant]) as _, i}
            <div class="h-3 bg-gray-200 rounded {i === contentLines[variant] - 1 ? 'w-1/2' : 'w-full'}"></div>
        {/each}
    </div>
    
    <!-- Footer placeholder -->
    <div class="flex items-center justify-between pt-2 border-t border-gray-100">
        <div class="h-3 bg-gray-200 rounded w-16"></div>
        <div class="h-6 w-6 bg-gray-200 rounded"></div>
    </div>
</div>