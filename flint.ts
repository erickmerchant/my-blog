import css from "@flint/framework/handlers/css";
import flint, { pattern as p } from "@flint/framework";
import { getPostURLs as posts } from "./models/post.ts";
import home from "./pages/home.ts";
import post from "./pages/post.ts";
import resume from "./pages/resume.ts";
import rss from "./pages/rss.ts";
import notFound from "./pages/404.ts";

const app = flint()
  .route("/", home)
  .route(p`/posts/:slug/`, post, posts)
  .route("/resume/", resume)
  .route("/posts.rss", rss)
  .route("/robots.txt")
  .route(notFound)
  .file(p`/*.woff2`)
  .file(p`/*.png`)
  .file(p`/styles/:slug.css`, css);

export default app;

if (import.meta.main) {
  app.run();
}
