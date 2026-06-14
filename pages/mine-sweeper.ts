import { h } from "@handcraft/lib";
import { getSite } from "../models/site.ts";
import page from "./page.ts";
import mineSweeper from "@erickmerchant/mine-sweeper";

const { article, h1, link, script, ul, li, a } = h.html;

export default async function (
  { params }: { params: { width: number; height: number; count: number } },
) {
  const site = await getSite();

  return page({
    site,
    pageTitle: "404 Not Found",
    headElements: [
      link.rel("stylesheet").href("/styles/alt.css"),
      script.type("module").src("/elements/mine-sweeper.js"),
    ],
    mainContent: [
      article.class("mines")(
        h1("Mine Sweeper"),
        ul.class("nav")(
          li(a.href("/mine-sweeper/8/8/10/")("Easy")),
          li(a.href("/mine-sweeper/16/16/40/")("Intermediate")),
          li(a.href("/mine-sweeper/20/20/62/")("Expert")),
        ),
        mineSweeper.width(params.width).height(params.height).count(
          params.count,
        ),
      ),
    ],
  });
}
