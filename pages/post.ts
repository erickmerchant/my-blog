import { html } from "@handcraft/lib/h";
import attr from "@handcraft/lib/attr";
import text from "@handcraft/lib/text";
import { asLocalDate } from "../utils/dates.ts";
import page from "./page.ts";
import { getSite } from "../models/site.ts";
import { getPostBySlug } from "../models/post.ts";

export default async function ({ params }: { params: { slug?: string } }) {
  if (!params.slug) return new Response("", { status: 404 });

  const site = await getSite();
  const post = await getPostBySlug(params.slug);

  return page({
    site,
    pageTitle: post.title,
    mainContent: [
      html.article(
        attr.class("post"),
        html.div(
          html.h1(text(post.title)),
          html.time(
            attr.class("date"),
            text(asLocalDate(post.datePublished as Temporal.PlainDate)),
          ),
        ),
        ...post.content,
      ),
    ],
  });
}
