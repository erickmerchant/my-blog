import css from "@flint/framework/handlers/css";
import flint, { pattern as p } from "@flint/framework";
import { getPostURLs as posts } from "./src/models/post.ts";
import home from "./src/views/home.ts";
import post from "./src/views/post.ts";
import resume from "./src/views/resume.ts";
import rss from "./src/views/rss.ts";
import notFound from "./src/views/404.ts";

const app = flint("src", "dist")
  .route("/", { handler: home })
  .route(p`/posts/:slug/`, { handler: post, cache: posts })
  .route("/resume/", { handler: resume })
  .route("/posts.rss", { handler: rss })
  .route(notFound)
  .file(p`/*.woff2`)
  .file(p`/*.png`)
  .file("/robots.txt")
  .file("/page.css", { handler: css })
  .file("/post.css", { handler: css })
  .file("/home.css", { handler: css })
  .file("/resume.css", { handler: css });

export default app;

if (import.meta.main) {
  app.run();
}
