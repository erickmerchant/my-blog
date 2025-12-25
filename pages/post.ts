import type { FlintRouteContext } from "@flint/framework";
import { fragment, h } from "@handcraft/lib";
import { asLocalDate } from "../utils/dates.ts";
import * as Markdown from "../utils/markdown.ts";
import page from "./page.ts";
import { getSite } from "../models/site.ts";
import { getPostBySlug } from "../models/post.ts";

const { link, article, div, h1, time } = h.html;

export default async function ({ params }: FlintRouteContext) {
  const site = await getSite();
  const post = await getPostBySlug(params.slug);

  return post
    ? page({
      site,
      pageTitle: post.title,
      stylesheet: link.rel("stylesheet").href("/styles/post.css"),
      mainContent: [
        article.class("article")(
          div(
            h1(post.title),
            time.class("status")(
              asLocalDate(post.datePublished as Temporal.PlainDate),
            ),
          ),
          fragment.html(await Markdown.parse(post.content)),
        ),
      ],
    })
    : "";
}
