import css from "@flint/framework/plugins/css";
import flint from "@flint/framework";
import { getPublishedPosts } from "./models/post.ts";
import home from "./views/home.js";
import post from "./views/post.js";
import rss from "./views/rss.ts";
import resume from "./views/resume.js";
import notFound from "./views/404.js";

const app = flint("public", "dist")
  .cache("/", "/posts.rss", "/resume/", async () => {
    const posts = await getPublishedPosts();

    return posts.map((post) => "/posts/" + post.slug + "/");
  })
  .route("/", home)
  .route("/posts/:slug/", post)
  .route("/posts.rss", rss)
  .route("/resume/", resume)
  .route(notFound)
  .use("/page.css", css)
  .use("/post.css", css)
  .use("/home.css", css)
  .use("/resume.css", css)
  .use("/*.woff2")
  .use("/*.png");

export default app;

if (import.meta.main) {
  app.run();
}
