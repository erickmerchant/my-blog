import { fragment as ƒ, h } from "@handcraft/lib/templating";
import { asLocalDate } from "../utils/dates.ts";
import page from "./page.ts";
import { getSite } from "../models/site.ts";
import { getPostBySlug } from "../models/post.ts";

const { article, div, h1, time } = h.html;

export default async function ({ params }: { params: { slug?: string } }) {
  if (!params.slug) return new Response("", { status: 404 });

  const site = await getSite();
  const post = await getPostBySlug(params.slug);

  return page({
    site,
    pageTitle: post.title,
    mainContent: [
      article.class("article")(
        div(
          h1(post.title),
          time.class("status")(
            asLocalDate(post.datePublished as Temporal.PlainDate),
          ),
        ),
        ƒ.html(post.content),
      ),
    ],
  });
}
