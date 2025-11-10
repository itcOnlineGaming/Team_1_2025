<script lang="ts">
    import Popup from '$lib/components/Popup.svelte';
    import TemplateSelector from '$lib/components/TemplateSelector.svelte';
    import { selectedTemplate } from '$lib/stores/templateStore';
    import { goto } from '$app/navigation';
    import templatesData from '$lib/data/templates.json';

    let showInitialPopup = $state(true);
    let consentChecked = $state(false);
    let selectedTemplateData: any = $state(null);

    const templates = templatesData.templates;

    function handleTemplateSelect(template: any) {
        selectedTemplateData = template;
        console.log('Template selected:', template);
    }

    function startTest() {
        if (consentChecked && selectedTemplateData) {
            selectedTemplate.set(selectedTemplateData);
            showInitialPopup = false;
            goto('/evaluation');
        }
    }

    function goToAdmin() {
        goto('/admin');
    }

    function goToViewTemplates() {
        goto('/templates/view');
    }
</script>

<main>
    <div class="nav-buttons">
        <button class="btn-info btn-sm" onclick={goToAdmin}>Admin</button>
        <button class="btn-info btn-sm" onclick={goToViewTemplates}>View Templates</button>
    </div>
    
    <div class="hero-content">
        <h1>Welcome</h1>
        <button class="btn-primary btn-large" onclick={() => { showInitialPopup = true; }}>
            Start Test
        </button>
    </div>
</main>

<Popup bind:isOpen={showInitialPopup} title="Welcome to Our User Test" showCloseButton={false}>
    <div class="popup-inner">
        <p><strong>Purpose:</strong> You'll be helping us evaluate our questionnaire system.</p>

        <p>
            <strong>Your Task:</strong> Complete a short questionnaire and share your honest feedback about your experience
        </p>

        <p><strong>Time Required:</strong> Approximately 1-2 minutes</p>

        <div class="template-section card">
            <label><strong>Select a Template:</strong></label>
            <TemplateSelector
                {templates}
                selectedId={selectedTemplateData?.id || ''}
                onSelect={handleTemplateSelect}
            />

            {#if selectedTemplateData}
                <p class="template-description">{selectedTemplateData.description}</p>
            {/if}
        </div>

        <div class="consent-section">
            <label class="checkbox-label">
                <input type="checkbox" bind:checked={consentChecked} />
                I consent to participate in this user test
            </label>
        </div>

        <button
            class="btn-primary btn-full"
            onclick={startTest}
            disabled={!consentChecked || !selectedTemplateData}
        >
            Start Test
        </button>
    </div>
</Popup>

<style>
    main {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background-color: var(--color-bg-primary);
    }

    .hero-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2rem;
    }

    .hero-content h1 {
        font-size: 3rem;
        margin: 0;
        color: var(--color-text-primary);
        text-align: center;
    }

    .nav-buttons {
        position: absolute;
        top: 1rem;
        right: 1rem;
        display: flex;
        gap: 0.5rem;
    }

    .popup-inner {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .popup-inner p {
        margin: 0;
        line-height: 1.6;
        color: var(--color-text-primary);
    }

    .popup-inner strong {
        color: var(--color-text-primary);
    }

    .template-section {
        margin-top: 0.5rem;
        background-color: var(--color-bg-primary);
        padding: 1.5rem;
    }

    .template-section label {
        display: block;
        margin-bottom: 0.75rem;
        color: var(--color-text-primary);
    }

    .template-description {
        margin-top: 0.75rem;
        margin-bottom: 0;
        font-size: 0.9rem;
        color: var(--color-text-secondary);
        font-style: italic;
        padding: 0.75rem;
        background-color: var(--color-bg-secondary);
        border-radius: 4px;
        border: 1px solid var(--color-border);
    }

    .consent-section {
        margin-top: 0.5rem;
        padding: 1rem;
        background-color: var(--color-bg-primary);
        border-radius: 4px;
        border: 1px solid var(--color-border);
    }

    .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        color: var(--color-text-primary);
        font-weight: 500;
    }

    .checkbox-label input[type='checkbox'] {
        cursor: pointer;
        width: 18px;
        height: 18px;
        accent-color: var(--color-accent);
    }

    @media (max-width: 768px) {
        .hero-content h1 {
            font-size: 2rem;
        }

        .nav-buttons {
            top: 0.5rem;
            right: 0.5rem;
            flex-direction: column;
        }
    }
</style>
