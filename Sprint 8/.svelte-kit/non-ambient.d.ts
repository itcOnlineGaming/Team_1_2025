
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/admin" | "/api" | "/api/feedback" | "/api/templates" | "/api/test" | "/evaluation" | "/results" | "/templates" | "/templates/create" | "/templates/view";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/admin": Record<string, never>;
			"/api": Record<string, never>;
			"/api/feedback": Record<string, never>;
			"/api/templates": Record<string, never>;
			"/api/test": Record<string, never>;
			"/evaluation": Record<string, never>;
			"/results": Record<string, never>;
			"/templates": Record<string, never>;
			"/templates/create": Record<string, never>;
			"/templates/view": Record<string, never>
		};
		Pathname(): "/" | "/admin" | "/admin/" | "/api" | "/api/" | "/api/feedback" | "/api/feedback/" | "/api/templates" | "/api/templates/" | "/api/test" | "/api/test/" | "/evaluation" | "/evaluation/" | "/results" | "/results/" | "/templates" | "/templates/" | "/templates/create" | "/templates/create/" | "/templates/view" | "/templates/view/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/robots.txt" | string & {};
	}
}