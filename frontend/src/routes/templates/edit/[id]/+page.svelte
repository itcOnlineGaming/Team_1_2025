<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { base } from '$app/paths';
    import { selectedTemplate } from '$lib/stores/templateStore';
    import CreateTemplate from '$lib/components/CreateTemplate.svelte';
    import type { Question } from '$lib/components/EvaluationQuestionnaire.svelte';

    interface Template {
        id: string;
        name: string;
        description: string;
        questions: Question[];
    }

    let templateToEdit: Template | null = null;
    let isLoading = true;
    let error = '';

    onMount(async () => {
        const templateId = $page.params.id;
        
        // Try to get from store first
        const storeTemplate = $selectedTemplate;
        if (storeTemplate && storeTemplate.id === templateId) {
            templateToEdit = storeTemplate;
            isLoading = false;
            return;
        }

        // Otherwise fetch from API
        try {
            const response = await fetch(`${base}/api/templates/${templateId}`);
            
            if (response.ok) {
                templateToEdit = await response.json();
            } else {
                error = 'Template not found';
                setTimeout(() => goto(`${base}/templates/view`), 2000);
            }
        } catch (err) {
            error = `Error loading template: ${err}`;
            setTimeout(() => goto(`${base}/templates/view`), 2000);
        } finally {
            isLoading = false;
        }
    });
</script>

{#if isLoading}
    <div class="loading">
        <div class="spinner"></div>
        <p>Loading template...</p>
    </div>
{:else if error}
    <div class="error-container">
        <div class="error-message">{error}</div>
        <p>Redirecting to templates page...</p>
    </div>
{:else if templateToEdit}
    <CreateTemplate initialTemplate={templateToEdit} isEditMode={true} />
{/if}

<style>
    .loading {
        text-align: center;
        padding: 3rem;
        color: var(--color-text-secondary);
    }

    .spinner {
        border: 3px solid var(--color-bg-secondary);
        border-top: 3px solid var(--color-accent);
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .error-container {
        text-align: center;
        padding: 3rem;
    }

    .error-message {
        background: var(--color-danger);
        color: white;
        padding: 1rem;
        border-radius: 4px;
        margin-bottom: 1rem;
        display: inline-block;
    }
</style>
