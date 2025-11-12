import { json } from '@sveltejs/kit';
import { writeFile, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import type { RequestHandler } from './$types';
import { join } from 'path';

const TEMPLATES_FILE = join(process.cwd(), 'src', 'lib', 'data', 'templates.json');

interface Question {
	id: string;
	label: string;
	type: string;
	stars: boolean;
	options?: string[];
}

interface Template {
	id: string;
	name: string;
	description: string;
	questions: Question[];
}

interface TemplatesData {
	templates: Template[];
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const newTemplate: Template = await request.json();

		if (!newTemplate.id || !newTemplate.name || !newTemplate.questions) {
			return new Response('Missing required fields', { status: 400 });
		}

		let templatesData: TemplatesData = { templates: [] };

		if (existsSync(TEMPLATES_FILE)) {
			const fileContent = await readFile(TEMPLATES_FILE, 'utf-8');
			templatesData = JSON.parse(fileContent);
		}

		const existingIndex = templatesData.templates.findIndex((t) => t.id === newTemplate.id);

		if (existingIndex >= 0) {
			templatesData.templates[existingIndex] = newTemplate;
		} else {
			templatesData.templates.push(newTemplate);
		}

		await writeFile(TEMPLATES_FILE, JSON.stringify(templatesData, null, 4), 'utf-8');

		return json({ success: true, template: newTemplate });
	} catch (error) {
		console.error('Error saving template:', error);
		return new Response('Error saving template', { status: 500 });
	}
};

export const GET: RequestHandler = async () => {
	try {
		if (!existsSync(TEMPLATES_FILE)) {
			return json({ templates: [] });
		}

		const fileContent = await readFile(TEMPLATES_FILE, 'utf-8');
		const templatesData = JSON.parse(fileContent);
		return json(templatesData);
	} catch (error) {
		console.error('Error reading templates:', error);
		return new Response('Error reading templates', { status: 500 });
	}
};
