import { html } from "@handcraft/lib/h";
import attr from "@handcraft/lib/attr";
import text from "@handcraft/lib/text";
import { getSite } from "../models/site.ts";
import page from "./page.ts";
import mineSweeper from "@erickmerchant/mine-sweeper";

export default async function () {
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
        attr.class("unfound"),
        html.div(
          attr.class("content"),
          html.h1(text("404 Not Found")),
          html.p(
            text(
              "The page you're looking doesn't exist. For your trouble, play some mine sweeper.",
            ),
          ),
          html.ul(
            html.li(
              html.a(attr.href("/mine-sweeper/8/8/10/"), text("Easy")),
              html.li(
                html.a(
                  attr.href("/mine-sweeper/16/16/40/"),
                  text("Intermediate"),
                ),
                html.li(
                  html.a(attr.href("/mine-sweeper/20/20/62/"), text("Expert")),
                ),
                html.p(
                  text("Or check the "),
                  html.a(attr.href("/"), text("home page")),
                  text(" for currently supported pages."),
                ),
              ),
            ),
          ),
        ),
        mineSweeper(attr.width(8), attr.height(8), attr.count(10)),
      ),
    ],
  });
}
