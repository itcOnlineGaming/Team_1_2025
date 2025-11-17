<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    
    let currentPath = $state('');
    
    $effect(() => {
        currentPath = $page.url.pathname;
    });
    
    function isActive(path: string): boolean {
        return currentPath === path || currentPath.startsWith(path + '/');
    }
</script>

<nav class="mobile-bottom-nav">
    <button 
        class="nav-item" 
        class:active={isActive(`${base}/`) && currentPath === `${base}/`}
        onclick={() => goto(`${base}/`)}
    >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span>Home</span>
    </button>
    <button 
        class="nav-item" 
        class:active={isActive(`${base}/templates`)}
        onclick={() => goto(`${base}/templates/view`)}
    >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
        <span>Templates</span>
    </button>
    <button 
        class="nav-item" 
        class:active={isActive(`${base}/results`)}
        onclick={() => goto(`${base}/results`)}
    >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 3v18h18"></path>
            <path d="M18 17V9"></path>
            <path d="M13 17V5"></path>
            <path d="M8 17v-3"></path>
        </svg>
        <span>Results</span>
    </button>
</nav>

<style>
    .mobile-bottom-nav {
        display: none;
    }

    @media (max-width: 768px) {
        .mobile-bottom-nav {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: var(--color-bg-primary);
            border-top: 1px solid var(--color-border);
            padding: 0.5rem 0;
            z-index: 9999;
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }

        .nav-item {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.25rem;
            background: none;
            border: none;
            padding: 0.5rem;
            cursor: pointer;
            color: var(--color-text-secondary);
            transition: all 0.2s ease;
            -webkit-tap-highlight-color: transparent;
        }

        .nav-item:hover,
        .nav-item:active,
        .nav-item.active {
            color: var(--color-primary);
        }

        .nav-item.active {
            background: var(--color-bg-secondary);
        }

        .nav-item svg {
            width: 24px;
            height: 24px;
            stroke-width: 2;
        }

        .nav-item span {
            font-size: 0.7rem;
            font-weight: 500;
        }
    }
</style>
