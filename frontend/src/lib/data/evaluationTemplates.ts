/**
 * Shared evaluation templates configuration
 * This ensures consistency across the application
 */

export interface EvaluationTemplate {
	id: string;
	name: string;
	description: string;
	questionCount: number;
}

export const evaluationTemplates: EvaluationTemplate[] = [
	{
		id: 'distraction-evaluation',
		name: 'Distraction & Focus Evaluation',
		description:
			'Comprehensive evaluation covering distractions, focus, engagement, and productivity',
		questionCount: 7
	}
];
