import file from "@flint/framework/plugins/file";
import css from "@flint/framework/plugins/css";
import flint from "@flint/framework";
import notFound from "./views/404.js";
import home from "./views/home.js";
import post from "./views/post.js";
import resume from "./views/resume.js";
import rss from "./views/rss.ts";
import { getPublishedPosts } from "./models/post.ts";

const app = flint("public")
	.cache("/", "/posts.rss", "/resume/", async () => {
		const posts = await getPublishedPosts();

		return posts.map((post) => "/posts/" + post.slug + "/");
	})
	.route("/", home)
	.route("/posts/:slug/", post)
	.route("/posts.rss", rss)
	.route("/resume/", resume)
	.route("/*.woff2", file)
	.route("/*.png", file)
	.route("/*.css", css)
	.route(notFound)
	.output("dist");

export default app;

if (import.meta.main) {
	app.run();
}
