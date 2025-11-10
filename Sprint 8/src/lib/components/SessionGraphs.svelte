<script lang="ts">
    import { sessionStats } from '$lib/stores/sessionStore';
    import { onMount } from 'svelte';
    import type { Session } from '$lib/stores/sessionStore';

    interface Props {
        showTable?: boolean;
        onViewDetails?: (session: Session) => void;
    }

    let { showTable = true, onViewDetails }: Props = $props();

    let chartData = $derived($sessionStats ? {
        labels: $sessionStats.sessions.map((s, i) => `Session ${i + 1}`),
        ratings: $sessionStats.sessions.map(s => s.overallRating || 0),
        durations: $sessionStats.sessions.map(s => Math.round(s.duration / 60))
    } : {
        labels: [],
        ratings: [],
        durations: []
    });

    // Generate SVG path for line chart
    function generateLinePath(data: number[], width: number, height: number, padding: number = 20): string {
        if (data.length === 0) return '';
        
        const maxValue = Math.max(...data, 1);
        const minValue = Math.min(...data, 0);
        const range = maxValue - minValue || 1;
        
        const xStep = (width - padding * 2) / (data.length - 1 || 1);
        
        let path = data.map((value, index) => {
            const x = padding + (index * xStep);
            const y = height - padding - ((value - minValue) / range) * (height - padding * 2);
            return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
        }).join(' ');
        
        return path;
    }

    function formatDuration(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }
</script>

<div class="session-graphs">
    {#if $sessionStats}
        <div class="stats-summary">
            <div class="stat-card">
                <div class="stat-value">{$sessionStats.totalSessions}</div>
                <div class="stat-label">Total Sessions</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{$sessionStats.averageRating.toFixed(1)}/5</div>
                <div class="stat-label">Average Rating</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{formatDuration(Math.round($sessionStats.averageDuration))}</div>
                <div class="stat-label">Avg Duration</div>
            </div>
        </div>

        <div class="charts-container">
            <!-- Ratings Line Chart -->
            <div class="chart-section">
                <h3>Session Ratings</h3>
                <div class="line-chart-container">
                    <svg class="line-chart" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid meet">
                        <!-- Grid lines -->
                        {#each [0, 1, 2, 3, 4, 5] as gridValue}
                            {@const y = 230 - (gridValue / 5) * 190}
                            <line 
                                x1="20" 
                                y1={y} 
                                x2="380" 
                                y2={y} 
                                stroke="var(--color-border)" 
                                stroke-width="1" 
                                opacity="0.3"
                            />
                            <text 
                                x="10" 
                                y={y + 4} 
                                font-size="10" 
                                fill="var(--color-text-secondary)"
                            >
                                {gridValue}
                            </text>
                        {/each}

                        <!-- Line path with gradient -->
                        <defs>
                            <linearGradient id="ratingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style="stop-color:var(--color-accent);stop-opacity:0.3" />
                                <stop offset="100%" style="stop-color:var(--color-accent);stop-opacity:0" />
                            </linearGradient>
                        </defs>

                        {#if chartData.ratings.length > 0}
                            <!-- Fill area under line -->
                            <path
                                d="{generateLinePath(chartData.ratings, 400, 250, 20)} L 380,230 L 20,230 Z"
                                fill="url(#ratingGradient)"
                            />
                            
                            <!-- Main line -->
                            <path
                                d={generateLinePath(chartData.ratings, 400, 250, 20)}
                                fill="none"
                                stroke="var(--color-accent)"
                                stroke-width="3"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                class="animated-line"
                            />
                        {/if}
                    </svg>
                </div>
            </div>

            <!-- Duration Line Chart -->
            <div class="chart-section">
                <h3>Session Duration (minutes)</h3>
                <div class="line-chart-container">
                    <svg class="line-chart" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid meet">
                        <!-- Grid lines -->
                        {#each Array(6) as _, i}
                            {@const maxDuration = Math.max(...chartData.durations, 1)}
                            {@const gridValue = Math.round((maxDuration / 5) * i)}
                            {@const y = 230 - (i / 5) * 190}
                            <line 
                                x1="20" 
                                y1={y} 
                                x2="380" 
                                y2={y} 
                                stroke="var(--color-border)" 
                                stroke-width="1" 
                                opacity="0.3"
                            />
                            <text 
                                x="5" 
                                y={y + 4} 
                                font-size="10" 
                                fill="var(--color-text-secondary)"
                            >
                                {gridValue}
                            </text>
                        {/each}

                        <!-- Line path with gradient -->
                        <defs>
                            <linearGradient id="durationGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style="stop-color:var(--color-success);stop-opacity:0.3" />
                                <stop offset="100%" style="stop-color:var(--color-success);stop-opacity:0" />
                            </linearGradient>
                        </defs>

                        {#if chartData.durations.length > 0}
                            <!-- Fill area under line -->
                            <path
                                d="{generateLinePath(chartData.durations, 400, 250, 20)} L 380,230 L 20,230 Z"
                                fill="url(#durationGradient)"
                            />
                            
                            <!-- Main line -->
                            <path
                                d={generateLinePath(chartData.durations, 400, 250, 20)}
                                fill="none"
                                stroke="var(--color-success)"
                                stroke-width="3"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                class="animated-line"
                            />
                        {/if}
                    </svg>
                </div>
            </div>
        </div>

        <!-- Sessions Table (Conditionally Rendered) -->
        {#if showTable}
            <div class="sessions-table">
                <h3>Recent Sessions</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Session</th>
                            <th>Template</th>
                            <th>Date</th>
                            <th>Duration</th>
                            <th>Rating</th>
                            {#if onViewDetails}
                                <th>Actions</th>
                            {/if}
                        </tr>
                    </thead>
                    <tbody>
                        {#each $sessionStats.sessions.slice().reverse() as session, i}
                            <tr>
                                <td>#{$sessionStats.sessions.length - i}</td>
                                <td>{session.templateName}</td>
                                <td>{new Date(session.startTime).toLocaleString()}</td>
                                <td>{formatDuration(session.duration)}</td>
                                <td>
                                    {#if session.overallRating}
                                        <span class="rating-display">
                                            {session.overallRating}/5 {'⭐'.repeat(session.overallRating)}
                                        </span>
                                    {:else}
                                        <span class="no-rating">N/A</span>
                                    {/if}
                                </td>
                                {#if onViewDetails}
                                    <td>
                                        <button 
                                            class="btn-info btn-sm"
                                            onclick={() => onViewDetails(session)}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                {/if}
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
    {:else}
        <div class="no-data">
            <p>📊 No session data available yet</p>
            <p class="no-data-subtext">Complete your first session to see analytics</p>
        </div>
    {/if}
</div>

<style>
    .session-graphs {
        padding: 1rem;
    }

    .stats-summary {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
    }

    .stat-card {
        background: var(--color-bg-secondary);
        padding: 1.5rem;
        border-radius: 8px;
        text-align: center;
        border: 2px solid var(--color-border);
    }

    .stat-value {
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--color-accent);
        margin-bottom: 0.5rem;
    }

    .stat-label {
        font-size: 0.9rem;
        color: var(--color-text-secondary);
        font-weight: 500;
    }

    .charts-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 2rem;
        margin-bottom: 2rem;
    }

    .chart-section {
        background: var(--color-bg-secondary);
        padding: 1.5rem;
        border-radius: 8px;
        border: 2px solid var(--color-border);
    }

    .chart-section h3 {
        margin: 0 0 1.5rem 0;
        color: var(--color-text-primary);
    }

    .line-chart-container {
        width: 100%;
        height: 250px;
        position: relative;
    }

    .line-chart {
        width: 100%;
        height: 100%;
    }

    .animated-line {
        stroke-dasharray: 1000;
        stroke-dashoffset: 1000;
        animation: draw 1.5s ease-out forwards;
    }

    @keyframes draw {
        to {
            stroke-dashoffset: 0;
        }
    }

    .sessions-table {
        background: var(--color-bg-secondary);
        padding: 1.5rem;
        border-radius: 8px;
        border: 2px solid var(--color-border);
        overflow-x: auto;
    }

    .sessions-table h3 {
        margin: 0 0 1rem 0;
        color: var(--color-text-primary);
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th {
        text-align: left;
        padding: 0.75rem;
        border-bottom: 2px solid var(--color-border);
        color: var(--color-text-primary);
        font-weight: 600;
    }

    td {
        padding: 0.75rem;
        border-bottom: 1px solid var(--color-border);
        color: var(--color-text-secondary);
    }

    tr:hover {
        background: var(--color-bg-primary);
    }

    .rating-display {
        font-weight: 500;
        color: var(--color-accent);
    }

    .no-rating {
        color: var(--color-text-secondary);
        opacity: 0.5;
    }

    .no-data {
        text-align: center;
        padding: 4rem 2rem;
        color: var(--color-text-secondary);
    }

    .no-data p:first-child {
        font-size: 2rem;
        margin-bottom: 0.5rem;
    }

    .no-data-subtext {
        font-size: 0.9rem;
        opacity: 0.7;
    }

    @media (max-width: 768px) {
        .charts-container {
            grid-template-columns: 1fr;
        }

        table {
            font-size: 0.85rem;
        }
    }
</style>
