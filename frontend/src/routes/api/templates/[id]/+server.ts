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

export const GET: RequestHandler = async ({ params }) => {
	try {
		if (!existsSync(TEMPLATES_FILE)) {
			return new Response('Template not found', { status: 404 });
		}

		const fileContent = await readFile(TEMPLATES_FILE, 'utf-8');
		const templatesData: TemplatesData = JSON.parse(fileContent);

		const template = templatesData.templates.find((t) => t.id === params.id);

		if (!template) {
			return new Response('Template not found', { status: 404 });
		}

		return json(template);
	} catch (error) {
		console.error('Error reading template:', error);
		return new Response('Error reading template', { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		if (!existsSync(TEMPLATES_FILE)) {
			return new Response('Templates file not found', { status: 404 });
		}

		const fileContent = await readFile(TEMPLATES_FILE, 'utf-8');
		const templatesData: TemplatesData = JSON.parse(fileContent);

		const templateIndex = templatesData.templates.findIndex((t) => t.id === params.id);

		if (templateIndex === -1) {
			return new Response('Template not found', { status: 404 });
		}

		// Prevent deleting the last template
		if (templatesData.templates.length <= 1) {
			return new Response('Cannot delete the last template', { status: 400 });
		}

		// Remove the template
		const deletedTemplate = templatesData.templates.splice(templateIndex, 1)[0];

		// Write back to file
		await writeFile(TEMPLATES_FILE, JSON.stringify(templatesData, null, 4), 'utf-8');

		return json({ success: true, deleted: deletedTemplate });
	} catch (error) {
		console.error('Error deleting template:', error);
		return new Response('Error deleting template', { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const updatedTemplate: Template = await request.json();

		if (!existsSync(TEMPLATES_FILE)) {
			return new Response('Templates file not found', { status: 404 });
		}

		const fileContent = await readFile(TEMPLATES_FILE, 'utf-8');
		const templatesData: TemplatesData = JSON.parse(fileContent);

		const templateIndex = templatesData.templates.findIndex((t) => t.id === params.id);

		if (templateIndex === -1) {
			return new Response('Template not found', { status: 404 });
		}

		// Update the template
		templatesData.templates[templateIndex] = {
			...templatesData.templates[templateIndex],
			...updatedTemplate,
			id: params.id // Ensure ID doesn't change
		};

		await writeFile(TEMPLATES_FILE, JSON.stringify(templatesData, null, 4), 'utf-8');

		return json({ success: true, template: templatesData.templates[templateIndex] });
	} catch (error) {
		console.error('Error updating template:', error);
		return new Response('Error updating template', { status: 500 });
	}
};
