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
        class:active={isActive(`${base}/store`)}
        onclick={() => goto(`${base}/store`)}
    >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <span>Store</span>
    </button>
    <button 
        class="nav-item" 
        class:active={isActive(`${base}/tasks`)}
        onclick={() => goto(`${base}/tasks`)}
    >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="9" x2="15" y2="9"></line>
            <line x1="9" y1="15" x2="15" y2="15"></line>
        </svg>
        <span>Tasks</span>
    </button>
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
    <button 
        class="nav-item" 
        class:active={isActive(`${base}/info`)}
        onclick={() => goto(`${base}/info`)}
    >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <span>Info</span>
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
            background: var(--color-card-bg);
            border-top: 1px solid var(--color-border);
            padding: 0.5rem 0;
            z-index: 9999;
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.25);
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
            border-radius: 8px;
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
