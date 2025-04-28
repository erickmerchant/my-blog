import { html, unsafe } from "handcraft/prelude/all.js";
import base from "./base.ts";
import { addLeadingZeros } from "../main.ts";

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
      link().attr("rel", "stylesheet").attr("href", "/vendor/prism.css"),
    ],
    scripts: script().attr("src", "/vendor/prism.js"),
    main: article().classes("article").append(
      header().append(
        h1().text(post.title),
        post.date_published
          ? time().classes("status").text(
            post.date_published.getFullYear() +
              "-" +
              addLeadingZeros(post.date_published.getMonth() + 1) +
              "-" +
              addLeadingZeros(post.date_published.getDate()),
          )
          : span().classes("status").text("Draft"),
      ),
      unsafe(post.content),
    ),
  });
}
