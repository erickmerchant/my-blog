import css from "@flint/framework/handlers/css";
import js from "@flint/framework/handlers/js";
import flint, { pattern as p } from "@flint/framework";
import { view } from "@handcraft/lib/ssr";
import { getPostURLs as posts } from "./models/post.ts";
import home from "./pages/home.ts";
import post from "./pages/post.ts";
import rss from "./pages/rss.ts";
import notFound from "./pages/404.ts";
import mineSweeper from "./pages/mine-sweeper.ts";

const app = flint()
  .route("/", view(home))
  .route(p`/posts/:slug/`, view(post), posts)
  .route("/posts.rss", rss)
  .route("/robots.txt")
  .route(p`/mine-sweeper/:width/:height/:count/`, view(mineSweeper), [
    "/mine-sweeper/8/8/10/",
    "/mine-sweeper/16/16/40/",
    "/mine-sweeper/20/20/62/",
  ])
  .route(view(notFound))
  .file(p`/*.woff2`)
  .file(p`/*.png`)
  .file(p`/media/**/*.jpg`)
  .file("/styles/main.css", css)
  .file("/styles/alt.css", css)
  .file("/elements/mine-sweeper.js", js);

export default app;

if (import.meta.main) {
  app.run();
}
