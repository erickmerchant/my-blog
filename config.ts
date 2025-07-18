import notFound from "./views/404.js";
import home from "./views/home.js";
import post from "./views/post.js";
import resume from "./views/resume.js";
import rss from "./views/rss.ts";
import file from "./app/plugins/file.ts";
import css from "./app/plugins/css.ts";
import { getPublishedPosts } from "./models/post.ts";

export const config: Config = {
	routes: [
		{ pattern: "/", handler: home },
		{
			async cache() {
				const posts = await getPublishedPosts();
				return posts.map((post) => `/posts/${post.slug}/`);
			},
			pattern: "/posts/:slug/",
			handler: post,
		},
		{ pattern: "/resume/", handler: resume },
		{
			pattern: "/posts.rss",
			contentType: "application/rss+xml",
			handler: rss,
		},
	],
	notFound: { handler: notFound },
	watch: ["content", "public"],
	plugins: [
		{
			pattern: "/*/:name.woff2",
			handler: file,
		},
		{
			pattern: "/*/:name.png",
			handler: file,
		},
		{
			pattern: "/*/:name.css",
			handler: css,
		},
	],
};
