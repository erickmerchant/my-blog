type RouteParams = { params: any; urls: Record<string, string> };

type RouteHandler = (
	args: RouteParams,
) => any;

type PluginParams = {
	path: string;
	content: Uint8Array<ArrayBufferLike>;
	urls: Record<string, string>;
};

type PluginHandler = (
	args: PluginParams,
) => Uint8Array<ArrayBufferLike> | Promise<Uint8Array<ArrayBufferLike>>;

type Route = {
	cache?:
		| boolean
		| string
		| Array<string>
		| (() => Array<string> | Promise<Array<string>>);
	status?: number;
	contentType?: string;
	pattern: URLPattern | string;
	handler: RouteHandler;
};

type Config = {
	notFound: {
		handler: RouteHandler;
	};
	routes: Array<Route>;
	urls?: Record<string, string>;
	plugins: Array<{
		pattern: URLPattern | string;
		handler: PluginHandler;
	}>;
	watch: Array<string>;
};
