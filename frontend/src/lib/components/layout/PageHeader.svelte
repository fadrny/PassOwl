<script lang="ts">
    import Button from '$lib/components/ui/Button.svelte';

    interface Props {
        title: string;
        description: string;
        buttonText?: string;
        buttonVariant?: 'primary' | 'secondary' | 'danger' | 'ghost';
        buttonSize?: 'sm' | 'md' | 'lg';
        onButtonClick?: () => void;
        showButton?: boolean;
    }

    let { 
        title, 
        description, 
        buttonText = '', 
        buttonVariant = 'primary',
        buttonSize = 'lg',
        onButtonClick,
        showButton = true
    }: Props = $props();
</script>

<div class="flex items-center justify-between">
    <div>
        <h1 class="text-2xl font-bold text-gray-900">{title}</h1>
        <p class="mt-1 text-sm text-gray-600 pr-2">
            {description}
        </p>
    </div>
    
    {#if showButton && buttonText}
        <Button 
            type="button" 
            variant={buttonVariant}
            size={buttonSize}
            onclick={onButtonClick}
        >
            {buttonText}
        </Button>
    {/if}
</div>