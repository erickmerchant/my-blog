import css from "@flint/framework/handlers/css";
import flint, { pattern as p } from "@flint/framework";
import { getPostURLs as posts } from "./models/post.ts";
import home from "./views/home.ts";
import post from "./views/post.ts";
import rss from "./views/rss.ts";
import resume from "./views/resume.ts";
import notFound from "./views/404.ts";

const app = flint("public", "dist")
  .route("/", home)
  .route(p`/posts/:slug/`, post, posts)
  .route("/resume/", resume)
  .route("/posts.rss", rss)
  .route(notFound)
  .file(p`/*.woff2`)
  .file(p`/*.png`)
  .file("/page.css", css)
  .file("/post.css", css)
  .file("/home.css", css)
  .file("/resume.css", css);

export default app;

if (import.meta.main) {
  app.run();
}
