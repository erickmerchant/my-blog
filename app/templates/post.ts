import { h, unsafe } from "../h.ts";
import base from "./base.ts";
import { asLocalDate } from "../utils.ts";

const { link, article, header, h1, time, span } = h.html;

type Props = {
  site: Site;
  post: Post;
};

export default function ({ site, post }: Props) {
  return base({
    site,
    pageTitle: post.title,
    styles: [
      link.rel("stylesheet").href("/post.css"),
      post.components.includes("code") &&
      link.rel("stylesheet").href("/code.css"),
      post.components.includes("highlighting") &&
      link.rel("stylesheet").href("/prism.css"),
    ],
    main: article.class("article")(
      header(
        h1(post.title),
        post.datePublished
          ? time.class("status")(
            asLocalDate(post.datePublished),
          )
          : span.class("status")("Draft"),
      ),
      unsafe(post.content),
    ),
  });
}
