import css from "@flint/framework/plugins/css";
import flint from "@flint/framework";
import { getPublishedPosts } from "./models/post.ts";

const app = flint("public", "dist")
	.cache("/", "/posts.rss", "/resume/", async () => {
		const posts = await getPublishedPosts();

		return posts.map((post) => "/posts/" + post.slug + "/");
	})
	.route("/", "./views/home.js")
	.route("/posts/:slug/", "./views/post.js")
	.route("/posts.rss", "./views/rss.ts")
	.route("/resume/", "./views/resume.js")
	.route("./views/404.js")
	.use("/*.css", css)
	.use("/*.woff2")
	.use("/*.png");

export default app;

if (import.meta.main) {
	app.run();
}
