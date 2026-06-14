import { h } from "@handcraft/lib";
import { getSite } from "../models/site.ts";
import page from "./page.ts";
import mineSweeper from "@erickmerchant/mine-sweeper";

const { article, h1, link, script, div, p, ul, li, a } = h.html;

export default async function () {
  const site = await getSite();

  return page({
    site,
    pageTitle: "404 Not Found",
    headElements: [
      link.rel("stylesheet").href("/styles/alt.css"),
      script.type("module").src("/elements/mine-sweeper.js"),
    ],
    mainContent: [
      article.class("unfound")(
        div.class("content")(
          h1("404 Not Found"),
          p("The page you're looking doesn't exist. For your trouble play some mine sweeper."),
          ul(
            li(a.href("/mine-sweeper/8/8/10/")("Easy")),
            li(a.href("/mine-sweeper/16/16/40/")("Intermediate")),
            li(a.href("/mine-sweeper/20/20/62/")("Expert")),
          ),
          p(
            "Or check the ",
            a.href("/")("home page"),
            " for currently supported pages.",
          ),
        ),
        mineSweeper.width(8).height(8).count(10),
      ),
    ],
  });
}
