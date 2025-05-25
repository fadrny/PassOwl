<script>
    import DashboardCard from '$lib/components/layout/DashboardCard.svelte';
</script>

<div class="border-4 border-dashed border-gray-200 rounded-lg p-8">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">Vítejte v PassOwl!</h2>
    <p class="text-gray-600 mb-6">
        Vaše bezpečná aplikace pro správu hesel je připravena k použití.
    </p>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
            title="Hesla"
            description="Spravujte svá hesla bezpečně"
            buttonText="Zobrazit hesla"
            onclick={() => console.log('Navigate to passwords')}
        />
        
        <DashboardCard
            title="Bezpečné poznámky"
            description="Ukládejte důležité informace"
            buttonText="Zobrazit poznámky"
            onclick={() => console.log('Navigate to notes')}
        />
        
        <DashboardCard
            title="Kategorie"
            description="Organizujte svá hesla"
            buttonText="Spravovat kategorie"
            onclick={() => console.log('Navigate to categories')}
        />
    </div>
</div>