<script lang="ts">
    import type { Question } from '$lib/components/EvaluationQuestionnaire.svelte';
    import { selectedTemplate } from '$lib/stores/templateStore';
    import { onMount } from 'svelte';
    import templatesData from '$lib/data/templates.json';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import MobileBottomNav from '$lib/components/MobileBottomNav.svelte';


    interface Template {
        id: string;
        name: string;
        description: string;
        questions: Question[];
    }


    let templates: Template[] = [];
    let selectedPreview: Template | null = null;
    let deleteConfirmModal: Template | null = null;
    let isLoading = true;
    let error = '';


    onMount(() => {
        try {
            templates = templatesData.templates as Template[];
            isLoading = false;
        } catch (err) {
            error = `Error loading templates: ${err}`;
            isLoading = false;
        }
    });


    function navigateToCreate() {
        goto(`${base}/templates/create`);
    }


    function navigateToEdit(template: Template, event: Event) {
        event.stopPropagation();
        // Store the template to edit
        selectedTemplate.set(template);
        goto(`${base}/templates/edit/${template.id}`);
    }


    function openPreview(template: Template) {
        selectedPreview = template;
    }


    function closePreview() {
        selectedPreview = null;
    }


    function selectTemplate(template: Template | null) {
        if (!template) return;
        selectedTemplate.set(template);
        closePreview();
    }


    function openDeleteConfirm(template: Template, event: Event) {
        event.stopPropagation();
        deleteConfirmModal = template;
    }


    function closeDeleteConfirm() {
        deleteConfirmModal = null;
    }


    async function confirmDelete() {
        if (!deleteConfirmModal) return;


        try {
            const response = await fetch(`${base}/api/templates/${deleteConfirmModal.id}`, {
                method: 'DELETE'
            });


            if (response.ok) {
                templates = templates.filter(t => t.id !== deleteConfirmModal?.id);
                closeDeleteConfirm();
            } else {
                const errorText = await response.text();
                error = `Error deleting template: ${errorText}`;
            }
        } catch (err) {
            error = `Error deleting template: ${err}`;
        }
    }


    function goBack() {
        history.back();
    }


    function getQuestionTypeIcon(type: string): string {
        switch (type) {
            case 'text':
                return '📝';
            case 'textarea':
                return '📄';
            case 'select':
                return '📋';
            case 'number':
                return '🔢';
            case 'none':
                return '⭐';
            default:
                return '❓';
        }
    }


    function getRatingTypeIcon(starType?: string): string {
        switch (starType) {
            case 'stars':
                return '⭐';
            case 'slider':
                return '🎚️';
            case 'emoji':
                return '😊';
            case 'numeric':
                return '🔢';
            default:
                return '⭐';
        }
    }


    function getRatingTypeName(starType?: string): string {
        if (!starType) return 'Stars';
        return starType.charAt(0).toUpperCase() + starType.slice(1);
    }
</script>


<div class="template-library">
    <div class="header">
        <div class="header-left">
            <button class="btn-back" onclick={goBack} title="Go back">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back
            </button>
            <h2>Template Library</h2>
        </div>
        <button class="btn-success" onclick={navigateToCreate}>+ Create Template</button>
    </div>


    {#if error}
        <div class="error-message">{error}</div>
    {/if}


    {#if isLoading}
        <div class="loading">
            <div class="spinner"></div>
            <p>Loading templates...</p>
        </div>
    {:else if templates.length === 0}
        <div class="empty-state">
            <p>📋 No templates available</p>
            <p class="empty-subtext">Create your first template to get started</p>
        </div>
    {:else}
        <div class="template-grid">
            {#each templates as template}
                <div 
                    class="template-card card" 
                    role="button"
                    tabindex="0"
                    onclick={() => openPreview(template)}
                    onkeydown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openPreview(template);
                        }
                    }}
                >
                    <div class="card-header">
                        <h3>{template.name}</h3>
                        <span class="badge badge-info">{template.questions.length} Q</span>
                    </div>


                    <p class="card-description">
                        {template.description || 'No description provided'}
                    </p>


                    <div class="card-footer">
                        <span class="template-id">ID: {template.id}</span>
                        <div class="question-types">
                            {#each [...new Set(template.questions.map((q) => q.type))] as type}
                                <span class="type-icon" title={type}>
                                    {getQuestionTypeIcon(type)}
                                </span>
                            {/each}
                            {#if template.questions.some((q) => q.stars)}
                                <span class="type-icon" title="Has ratings">⭐</span>
                            {/if}
                        </div>
                    </div>


                    <div class="card-actions">
                        <button 
                            class="btn-icon btn-edit" 
                            onclick={(e) => navigateToEdit(template, e)}
                            title="Edit template"
                            type="button"
                        >
                            ✏️
                        </button>
                        {#if templates.length > 1}
                            <button 
                                class="btn-icon btn-delete" 
                                onclick={(e) => openDeleteConfirm(template, e)}
                                title="Delete template"
                                type="button"
                            >
                                🗑️
                            </button>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<!-- Preview Modal -->
{#if selectedPreview}
    <div class="modal-overlay" role="presentation" onclick={closePreview} onkeydown={(e) => e.key === 'Escape' && closePreview()}>
        <div class="modal-content card" role="dialog" tabindex="0" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
            <div class="modal-header">
                <div>
                    <h2>{selectedPreview.name}</h2>
                    <p class="modal-subtitle">Template ID: {selectedPreview.id}</p>
                </div>
                <button class="btn-close" onclick={closePreview} type="button">✕</button>
            </div>


            {#if selectedPreview.description}
                <div class="modal-description">
                    <p>{selectedPreview.description}</p>
                </div>
            {/if}


            <div class="modal-body">
                <h3>Questions ({selectedPreview.questions.length})</h3>


                {#each selectedPreview.questions as question, i}
                    <div class="question-preview">
                        <div class="question-preview-header">
                            <span class="badge badge-info">Q{i + 1}</span>
                            <span class="badge badge-secondary">{question.type}</span>
                            {#if question.stars || question.type === 'none'}
                                <span class="badge badge-accent">
                                    {getRatingTypeIcon(question.starType)}
                                    {getRatingTypeName(question.starType)} Rating
                                </span>
                            {/if}
                            {#if question.required}
                                <span class="badge badge-required">Required</span>
                            {/if}
                        </div>


                        <p class="question-label">{question.label}</p>


                        {#if question.type === 'select' && question.options}
                            <div class="options-preview">
                                <span class="options-label">Options:</span>
                                <ul>
                                    {#each question.options as option}
                                        <li>{option}</li>
                                    {/each}
                                </ul>
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>


            <div class="modal-footer">
                <button class="btn-secondary" onclick={closePreview} type="button">Close</button>
                <button class="btn-primary" onclick={() => selectTemplate(selectedPreview)} type="button">
                    Use This Template
                </button>
            </div>
        </div>
    </div>
{/if}

<!-- Delete Confirmation Modal -->
{#if deleteConfirmModal}
    <div class="modal-overlay" role="presentation" onclick={closeDeleteConfirm} onkeydown={(e) => e.key === 'Escape' && closeDeleteConfirm()}>
        <div class="modal-content card delete-modal" role="alertdialog" tabindex="0" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
            <div class="modal-header">
                <h2>Delete Template</h2>
                <button class="btn-close" onclick={closeDeleteConfirm} type="button">✕</button>
            </div>


            <div class="modal-body">
                <div class="delete-warning">
                    <svg class="warning-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                    </svg>
                    <p class="delete-message">
                        Are you sure you want to delete <strong>"{deleteConfirmModal.name}"</strong>?
                    </p>
                    <p class="delete-submessage">
                        This action cannot be undone. The template and all its questions will be permanently removed.
                    </p>
                </div>
            </div>


            <div class="modal-footer">
                <button class="btn-secondary" onclick={closeDeleteConfirm} type="button">
                    Cancel
                </button>
                <button class="btn-danger" onclick={confirmDelete} type="button">
                    Yes, Delete Template
                </button>
            </div>
        </div>
    </div>
{/if}

<MobileBottomNav />

<style>
    .template-library {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }


    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    }


    .header-left {
        display: flex;
        align-items: center;
        gap: 1rem;
    }


    .header h2 {
        margin: 0;
        font-size: 1.8rem;
        color: var(--color-text-on-dark);
    }


    .error-message {
        background: var(--color-error-bg, #ffebee);
        color: var(--color-error, #c62828);
        padding: 1rem;
        border-radius: 4px;
        margin-bottom: 1rem;
        border: 1px solid var(--color-error, #c62828);
    }


    .loading {
        text-align: center;
        padding: 3rem;
        color: var(--color-text-on-dark);
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


    .btn-back {
        background: var(--color-card-bg);
        color: var(--color-text-primary);
        border: 1px solid var(--color-border);
        padding: 0.6rem 1.2rem;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.95rem;
        font-weight: 500;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .btn-back svg {
        width: 18px;
        height: 18px;
    }

    .btn-back:hover {
        background: var(--color-primary);
        color: white;
        border-color: var(--color-primary);
        transform: translateX(-2px);
    }


    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }


    .empty-state {
        text-align: center;
        padding: 3rem;
        color: var(--color-text-on-dark);
    }


    .empty-state p:first-child {
        font-size: 3rem;
        margin-bottom: 0.5rem;
    }


    .empty-subtext {
        font-size: 0.9rem;
        color: var(--color-text-secondary);
        opacity: 0.7;
    }


    .template-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
    }


    .template-card {
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
        border: 2px solid var(--color-border);
        position: relative;
    }


    .template-card:hover {
        border-color: var(--color-accent);
        box-shadow: 0 4px 12px rgba(123, 104, 166, 0.2);
        transform: translateY(-2px);
    }


    .template-card:hover .card-actions {
        opacity: 1;
    }


    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: start;
        margin-bottom: 0.75rem;
    }


    .card-header h3 {
        margin: 0;
        font-size: 1.2rem;
        color: var(--color-text-primary);
        flex: 1;
        line-height: 1.3;
    }


    .badge {
        padding: 0.25rem 0.6rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        margin-left: 0.5rem;
        white-space: nowrap;
    }


    .badge-info {
        background: var(--color-accent);
        color: white;
    }


    .badge-secondary {
        background: var(--color-bg-secondary);
        color: var(--color-text-primary);
        border: 1px solid var(--color-border);
    }


    .badge-accent {
        background: rgba(123, 104, 166, 0.1);
        color: var(--color-accent);
        border: 1px solid var(--color-accent);
    }


    .badge-required {
        background: #ffebee;
        color: #c62828;
        border: 1px solid #ef5350;
    }


    .card-description {
        color: var(--color-text-secondary);
        font-size: 0.9rem;
        margin-bottom: 1rem;
        flex: 1;
        line-height: 1.5;
    }


    .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 0.75rem;
        border-top: 1px solid var(--color-border);
    }


    .template-id {
        font-size: 0.75rem;
        color: var(--color-text-secondary);
        font-family: monospace;
    }


    .question-types {
        display: flex;
        gap: 0.25rem;
    }


    .type-icon {
        font-size: 1.2rem;
    }


    .card-actions {
        position: absolute;
        top: 0.75rem;
        right: 0.75rem;
        display: flex;
        gap: 0.5rem;
        opacity: 0;
        transition: opacity 0.2s;
    }


    .btn-icon {
        background: white;
        border: 1px solid var(--color-border);
        border-radius: 4px;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 1rem;
        transition: all 0.2s;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }


    .btn-edit:hover {
        background: #e3f2fd;
        border-color: #2196f3;
        transform: scale(1.1);
    }


    .btn-delete:hover {
        background: #ffebee;
        border-color: #ef5350;
        transform: scale(1.1);
    }


    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(79, 52, 34, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 1rem;
    }


    .modal-content {
        max-width: 700px;
        width: 100%;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 20px 60px rgba(79, 52, 34, 0.3);
    }


    .delete-modal {
        max-width: 500px;
    }


    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: start;
        padding: 1.5rem;
        border-bottom: 1px solid var(--color-border);
        background-color: var(--color-bg-primary);
    }


    .modal-header h2 {
        margin: 0;
        font-size: 1.5rem;
        color: var(--color-text-primary);
    }


    .modal-subtitle {
        font-size: 0.85rem;
        color: var(--color-text-secondary);
        margin: 0.25rem 0 0 0;
        font-family: monospace;
    }


    .btn-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        color: var(--color-text-secondary);
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: all 0.2s;
    }


    .btn-close:hover {
        background: var(--color-bg-secondary);
        color: var(--color-text-primary);
    }


    .modal-description {
        padding: 1rem 1.5rem;
        background: var(--color-bg-secondary);
        border-bottom: 1px solid var(--color-border);
    }


    .modal-description p {
        margin: 0;
        color: var(--color-text-secondary);
        line-height: 1.6;
    }


    .modal-body {
        padding: 1.5rem;
        overflow-y: auto;
        flex: 1;
    }


    .modal-body h3 {
        margin: 0 0 1rem 0;
        font-size: 1.1rem;
        color: var(--color-text-primary);
    }


    .question-preview {
        background: var(--color-bg-secondary);
        border: 1px solid var(--color-border);
        border-radius: 6px;
        padding: 1rem;
        margin-bottom: 0.75rem;
    }


    .question-preview-header {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        margin-bottom: 0.5rem;
        flex-wrap: wrap;
    }


    .question-label {
        margin: 0.5rem 0 0 0;
        font-weight: 500;
        color: var(--color-text-primary);
    }


    .options-preview {
        margin-top: 0.75rem;
        padding-top: 0.75rem;
        border-top: 1px solid var(--color-border);
    }


    .options-label {
        font-size: 0.85rem;
        color: var(--color-text-secondary);
        font-weight: 600;
    }


    .options-preview ul {
        margin: 0.5rem 0 0 0;
        padding-left: 1.5rem;
    }


    .options-preview li {
        font-size: 0.9rem;
        color: var(--color-text-secondary);
        margin: 0.25rem 0;
    }


    .delete-warning {
        text-align: center;
    }


    .warning-icon {
        width: 64px;
        height: 64px;
        color: #ef5350;
        margin: 0 auto 1rem;
    }


    .delete-message {
        font-size: 1.1rem;
        color: var(--color-text-primary);
        margin: 0 0 0.75rem 0;
        line-height: 1.5;
    }


    .delete-message strong {
        color: var(--color-accent);
    }


    .delete-submessage {
        font-size: 0.9rem;
        color: var(--color-text-secondary);
        margin: 0;
        line-height: 1.5;
    }


    .modal-footer {
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
        padding: 1rem 1.5rem;
        border-top: 1px solid var(--color-border);
        background-color: var(--color-bg-primary);
    }


    .btn-danger {
        background: #ef5350;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.95rem;
        font-weight: 600;
        transition: all 0.2s;
    }


    .btn-danger:hover {
        background: #c62828;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(198, 40, 40, 0.3);
    }


    @media (max-width: 768px) {
        .template-grid {
            grid-template-columns: 1fr;
        }


        .modal-content {
            max-height: 95vh;
            margin: 0.5rem;
        }


        .header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
        }

        .header-left {
            width: 100%;
            flex-direction: column;
            align-items: flex-start;
        }

        .btn-back {
            width: 100%;
            justify-content: center;
        }

        .btn-success {
            width: 100%;
        }

        .template-library {
            padding: 1rem;
            padding-bottom: 5rem; /* Add padding for bottom nav */
        }


        .card-actions {
            opacity: 1;
        }
    }
</style>
