import notFound from "./views/404.js";
import home from "./views/home.js";
import post from "./views/post.js";
import resume from "./views/resume.js";
import rss from "./views/rss.ts";
import file from "./app/plugins/file.ts";
import css from "./app/plugins/css.ts";

export const config = {
	routes: [notFound, home, post, resume, rss],
	plugins: [
		{
			urlPattern: new URLPattern({ pathname: "/*/:file.woff2" }),
			run: file,
		},
		{
			urlPattern: new URLPattern({ pathname: "/*/:file.png" }),
			run: file,
		},
		{
			urlPattern: new URLPattern({ pathname: "/*/:file.css" }),
			run: css,
		},
	],
};
