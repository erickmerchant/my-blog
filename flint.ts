import css from "@flint/framework/handlers/css";
import flint, { pattern as p } from "@flint/framework";
import { getPostURLs as posts } from "./src/models/post.ts";
import home from "./src/views/home.ts";
import post from "./src/views/post.ts";
import resume from "./src/views/resume.ts";
import rss from "./src/views/rss.ts";
import notFound from "./src/views/404.ts";

const app = flint("src", "dist")
  .route("/", home)
  .route(p`/posts/:slug/`, post, posts)
  .route("/resume/", resume)
  .route("/posts.rss", rss)
  .route(notFound)
  .file(p`/*.woff2`)
  .file(p`/*.png`)
  .file("/robots.txt")
  .file("/styles/page.css", css)
  .file("/styles/post.css", css)
  .file("/styles/resume.css", css);

export default app;

if (import.meta.main) {
  app.run();
}
