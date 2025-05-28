<script lang="ts">
	import type { PageData } from './$types';
    import PasswordTable from '$lib/components/tables/PasswordTable.svelte';
    import Button from '$lib/components/ui/Button.svelte';
	let { data }: { data: PageData } = $props();

    let passwords = [
        {
            id: '1',
            name: 'Gmail',
            username: 'Mark',
            encryptedPassword: 'encrypted_data',
            decryptedPassword: 'mypassword123',
            category: {
                id: 'cat1',
                name: 'Email',
                color: 'green'
            }
        }
    ];
    
    function handleDecrypt(id) {
        // Zde implementujte dešifrování
        console.log('Decrypt password:', id);
    }
    
    function handleEdit(id) {
        console.log('Edit password:', id);
    }
    
    function handleShare(id) {
        console.log('Share password:', id);
    }
</script>

<div class="flex justify-end mb-10">
    <Button type="button" variant="primary" size="lg">
        Přidat nové heslo
    </Button>
</div>


<PasswordTable 
    {passwords}
    onDecrypt={handleDecrypt}
    onEdit={handleEdit}
    onShare={handleShare}
/>

