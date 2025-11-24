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
        ratings: $sessionStats.sessions.map(s => {
            // Calculate average rating from all questions in this session
            const ratings = Object.values(s.responses)
                .filter(r => r.rating !== undefined && r.rating > 0)
                .map(r => r.rating!);
            return ratings.length > 0 
                ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
                : 0;
        }),
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
                <div class="stat-value">{$sessionStats.totalQuestions || 0}</div>
                <div class="stat-label">Questions Answered</div>
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
                                <stop offset="0%" stop-color="var(--color-primary)" stop-opacity="0.3" />
                                <stop offset="100%" stop-color="var(--color-primary)" stop-opacity="0" />
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
                                stroke="var(--color-primary)"
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
                                <stop offset="0%" stop-color="var(--color-success)" stop-opacity="0.3" />
                                <stop offset="100%" stop-color="var(--color-success)" stop-opacity="0" />
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
                            <th>Date</th>
                            <th>Duration</th>
                            <th>Questions</th>
                            <th>Avg Rating</th>
                            {#if onViewDetails}
                                <th>Actions</th>
                            {/if}
                        </tr>
                    </thead>
                    <tbody>
                        {#each $sessionStats.sessions.slice().reverse() as session, i}
                            {@const responseCount = Object.keys(session.responses).length}
                            {@const ratings = Object.values(session.responses)
                                .filter(r => r.rating !== undefined && r.rating > 0)
                                .map(r => r.rating!)}
                            {@const avgRating = ratings.length > 0 
                                ? ((ratings.reduce((a, b) => (a || 0) + (b || 0), 0)) / ratings.length).toFixed(1)
                                : null}
                            <tr>
                                <td>#{$sessionStats.sessions.length - i}</td>
                                <td>{new Date(session.startTime).toLocaleString()}</td>
                                <td>{formatDuration(session.duration)}</td>
                                <td>
                                    <span class="question-count">
                                        {responseCount} question{responseCount !== 1 ? 's' : ''}
                                    </span>
                                </td>
                                <td>
                                    {#if avgRating}
                                        <span class="rating-display">
                                            {avgRating}/5 {'⭐'.repeat(Math.round(parseFloat(avgRating)))}
                                        </span>
                                    {:else}
                                        <span class="no-rating">No ratings</span>
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
        padding: 0;
    }

    .stats-summary {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1.25rem;
        margin-bottom: 2.5rem;
    }

    .stat-card {
        background: var(--color-card-bg);
        padding: 2rem 1.5rem;
        border-radius: 12px;
        text-align: center;
        border: 2px solid var(--color-border);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
    }

    .stat-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.3s ease;
    }

    .stat-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(123, 104, 166, 0.2);
        border-color: var(--color-primary);
    }

    .stat-card:hover::before {
        transform: scaleX(1);
    }

    .stat-value {
        font-size: 2.75rem;
        font-weight: 800;
        color: var(--color-accent);
        margin-bottom: 0.5rem;
        line-height: 1;
    }

    .stat-label {
        font-size: 0.95rem;
        color: var(--color-text-secondary);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .charts-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2.5rem;
    }

    .chart-section {
        background: var(--color-card-bg);
        padding: 2rem;
        border-radius: 12px;
        border: 2px solid var(--color-border);
        transition: all 0.3s ease;
    }

    .chart-section:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }

    .chart-section h3 {
        margin: 0 0 1.75rem 0;
        color: var(--color-text-primary);
        font-size: 1.25rem;
        font-weight: 700;
    }

    .line-chart-container {
        width: 100%;
        height: 250px;
        position: relative;
        background: var(--color-bg-secondary);
        border-radius: 8px;
        padding: 0.5rem;
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
        background: var(--color-card-bg);
        padding: 2rem;
        border-radius: 12px;
        border: 2px solid var(--color-border);
        overflow-x: auto;
    }

    .sessions-table h3 {
        margin: 0 0 1.5rem 0;
        color: var(--color-text-primary);
        font-size: 1.25rem;
        font-weight: 700;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th {
        text-align: left;
        padding: 1rem 0.75rem;
        border-bottom: 2px solid var(--color-border);
        color: var(--color-text-primary);
        font-weight: 700;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    td {
        padding: 1rem 0.75rem;
        border-bottom: 1px solid var(--color-border);
        color: var(--color-text-secondary);
    }

    tr:last-child td {
        border-bottom: none;
    }

    tbody tr {
        transition: all 0.2s ease;
    }

    tbody tr:hover {
        background: var(--color-bg-secondary);
        transform: scale(1.01);
    }

    .rating-display {
        font-weight: 600;
        color: var(--color-accent);
    }

    .question-count {
        font-weight: 600;
        color: var(--color-primary);
        background: rgba(123, 104, 166, 0.15);
        padding: 0.35rem 0.75rem;
        border-radius: 14px;
        font-size: 0.85rem;
        display: inline-block;
    }

    .no-rating {
        color: var(--color-text-secondary);
        opacity: 0.6;
        font-style: italic;
    }

    .no-data {
        text-align: center;
        padding: 4rem 2rem;
        color: var(--color-text-on-dark);
        background: var(--color-card-bg);
        border-radius: 12px;
        border: 2px dashed var(--color-border);
    }

    .no-data p:first-child {
        font-size: 2.5rem;
        margin-bottom: 1rem;
        opacity: 0.8;
    }

    .no-data-subtext {
        font-size: 1.1rem;
        opacity: 0.7;
        color: var(--color-text-secondary);
    }

    @media (max-width: 1024px) {
        .charts-container {
            grid-template-columns: 1fr;
        }

        .stats-summary {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    @media (max-width: 768px) {
        .session-graphs {
            padding: 0;
        }

        .stats-summary {
            grid-template-columns: 1fr;
            gap: 1rem;
            margin-bottom: 2rem;
        }

        .stat-card {
            padding: 1.5rem;
        }

        .stat-value {
            font-size: 2.25rem;
        }

        .stat-label {
            font-size: 0.85rem;
        }

        .charts-container {
            grid-template-columns: 1fr;
            gap: 1.25rem;
            margin-bottom: 2rem;
        }

        .chart-section {
            padding: 1.5rem;
        }

        .chart-section h3 {
            font-size: 1.1rem;
            margin-bottom: 1.25rem;
        }

        .line-chart-container {
            height: 220px;
        }

        .sessions-table {
            padding: 1.5rem;
        }

        .sessions-table h3 {
            font-size: 1.1rem;
        }

        table {
            font-size: 0.85rem;
        }

        th, td {
            padding: 0.75rem 0.5rem;
        }

        th {
            font-size: 0.8rem;
        }

        .no-data p:first-child {
            font-size: 2rem;
        }

        .no-data-subtext {
            font-size: 1rem;
        }
    }

    @media (max-width: 480px) {
        .stat-card {
            padding: 1.25rem;
        }

        .stat-value {
            font-size: 2rem;
        }

        table {
            font-size: 0.8rem;
        }

        th, td {
            padding: 0.6rem 0.4rem;
        }
    }
</style>
