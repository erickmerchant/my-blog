import css from "@flint/framework/handlers/css";
import flint, { pattern as p } from "@flint/framework";
import { view } from "@handcraft/lib/ssr";
import { getPostURLs as posts } from "./models/post.ts";
import home from "./pages/home.ts";
import post from "./pages/post.ts";
import rss from "./pages/rss.ts";
import notFound from "./pages/404.ts";

const app = flint()
  .route("/", view(home))
  .route(p`/posts/:slug/`, view(post), posts)
  .route("/posts.rss", rss)
  .route("/robots.txt")
  .route(view(notFound))
  .file(p`/*.woff2`)
  .file(p`/*.png`)
  .file("/styles/main.css", css);

export default app;

if (import.meta.main) {
  app.run();
}
