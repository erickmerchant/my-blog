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
			pattern: "/*/:file.woff2",
			run: file,
		},
		{
			pattern: "/*/:file.png",
			run: file,
		},
		{
			pattern: "/*/:file.css",
			run: css,
		},
	],
};
