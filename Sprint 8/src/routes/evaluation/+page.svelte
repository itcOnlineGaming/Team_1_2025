<script lang="ts">
	import EvaluationQuestionnaire, {
		type Question
	} from '$lib/components/EvaluationQuestionnaire.svelte';

	const onSubmit = (responses) => {
		console.log('Received:', responses);
	};
	const template: Question[] = [
		{
			id: 'q1',
			label: 'Text example',
			type: 'text',
			stars: true
		},
		{
			id: 'q2',
			label: 'Select Example',
			type: 'select',
			options: ['Yes', 'No']
		},
		{
			id: 'q3',
			label: 'Number Example',
			type: 'number'
		}
	];
</script>

<EvaluationQuestionnaire {template} handleSubmit={onSubmit} />
