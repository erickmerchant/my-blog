import { html, unsafe, when } from "handcraft/prelude/all.js";
import base from "./base.tsx";
import { asLocalDate } from "../utils.ts";

const { link, script, article, header, h1, time, span } = html;

type Props = {
  site: Site;
  post: Post;
};

export default function ({ site, post }: Props) {
  return base({
    site,
    page_title: post.title,
    styles: [
      link().attr("rel", "stylesheet").attr("href", "/post.css"),
      when(() => post.components.includes("code")).show(() =>
        link().attr("rel", "stylesheet").attr("href", "/code.css")
      ),
      when(() => post.components.includes("highlighting")).show(() =>
        link().attr("rel", "stylesheet").attr("href", "/vendor/prism.css")
      ),
    ],
    scripts: when(() => post.components.includes("highlighting")).show(() =>
      script().attr("src", "/vendor/prism.js").attr("defer", true)
    ),
    main: article().classes("article").append(
      header().append(
        h1().text(post.title),
        post.datePublished
          ? time().classes("status").text(
            asLocalDate(post.datePublished),
          )
          : span().classes("status").text("Draft"),
      ),
      unsafe(post.content),
    ),
  });
}
