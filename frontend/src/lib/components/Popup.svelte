<script lang="ts">
    import { fade } from 'svelte/transition';

    let {
        isOpen = $bindable(false),
        title = '',
        showCloseButton = true,
        onClose = () => {},
        children
    }: {
        isOpen?: boolean;
        title?: string;
        showCloseButton?: boolean;
        onClose?: () => void;
        children?: any;
    } = $props();

    function handleClose() {
        isOpen = false;
        onClose();
    }

    function handleBackdropClick(e: MouseEvent) {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    }
</script>

{#if isOpen}
    <div
        class="popup-backdrop"
        transition:fade={{ duration: 200 }}
        onclick={handleBackdropClick}
        onkeydown={e => { if (e.key === 'Escape') handleClose(); }}
        role="dialog"
        aria-modal="true"
        tabindex="0"
    >
        <div class="popup-content">
            {#if title || showCloseButton}
                <div class="popup-header">
                    {#if title}
                        <h2>{title}</h2>
                    {/if}
                    {#if showCloseButton}
                        <button class="close-btn" onclick={handleClose} aria-label="Close"> ✕ </button>
                    {/if}
                </div>
            {/if}

            <div class="popup-body">
                {@render children?.()}
            </div>
        </div>
    </div>
{/if}

<style>
    .popup-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(79, 52, 34, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .popup-content {
        background: var(--color-bg-secondary);
        border-radius: 8px;
        max-width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 4px 12px rgba(79, 52, 34, 0.2);
        width: 500px;
        border: 1px solid var(--color-border);
    }

    .popup-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid var(--color-border);
        background-color: var(--color-bg-primary);
    }

    .popup-header h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--color-text-primary);
    }

    .close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--color-text-secondary);
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: all 0.2s;
    }

    .close-btn:hover {
        background-color: var(--color-bg-primary);
        color: var(--color-text-primary);
    }

    .popup-body {
        padding: 1.5rem;
        background-color: var(--color-bg-secondary);
    }
</style>
