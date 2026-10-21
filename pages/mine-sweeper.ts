import { html } from "@handcraft/lib/h";
import attr from "@handcraft/lib/attr";
import text from "@handcraft/lib/text";
import { getSite } from "../models/site.ts";
import page from "./page.ts";
import mineSweeper from "@erickmerchant/mine-sweeper";

export default async function (
  { params }: { params: { width: number; height: number; count: number } },
) {
  const site = await getSite();

  return page({
    site,
    pageTitle: "404 Not Found",
    headElements: [
      html.link(attr.rel("stylesheet"), attr.href("/styles/alt.css")),
      html.script(attr.type("module"), attr.src("/elements/mine-sweeper.js")),
    ],
    mainContent: [
      html.article(
        attr.class("mines"),
        html.h1(text("Mine Sweeper")),
        html.ul(
          attr.class("nav"),
          html.li(html.a(attr.href("/mine-sweeper/8/8/10/"), text("Easy"))),
          html.li(
            html.a(attr.href("/mine-sweeper/16/16/40/"), text("Intermediate")),
          ),
          html.li(html.a(attr.href("/mine-sweeper/20/20/62/"), text("Expert"))),
        ),
        mineSweeper(
          attr.width(params.width),
          attr.height(params.height),
          attr.count(params.count),
        ),
      ),
    ],
  });
}
