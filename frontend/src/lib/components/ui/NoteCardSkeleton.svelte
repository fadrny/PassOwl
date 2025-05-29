<script lang="ts">
    interface Props {
        variant?: 'short' | 'medium' | 'long';
    }

    let { variant = 'medium' }: Props = $props();

    const heights = {
        short: 'h-32',
        medium: 'h-40',
        long: 'h-48'
    };
</script>

<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 break-inside-avoid mb-4 animate-pulse">
    <!-- Header skeleton -->
    <div class="mb-3">
        <div class="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
    
    <!-- Content skeleton -->
    <div class="mb-4 space-y-2">
        <div class="h-3 bg-gray-200 rounded w-full"></div>
        <div class="h-3 bg-gray-200 rounded w-5/6"></div>
        <div class="h-3 bg-gray-200 rounded w-4/5"></div>
        {#if variant === 'long'}
            <div class="h-3 bg-gray-200 rounded w-full"></div>
            <div class="h-3 bg-gray-200 rounded w-3/4"></div>
        {/if}
    </div>
    
    <!-- Footer skeleton -->
    <div class="flex items-center justify-between pt-2 border-t border-gray-100">
        <div class="h-3 bg-gray-200 rounded w-20"></div>
        <div class="h-4 w-4 bg-gray-200 rounded"></div>
    </div>
</div>