import type { RSS, RssItem } from "../types.ts";
import * as XML from "fast-xml-parser";
import { asRFC822Date } from "../utils/dates.ts";
import { getSite } from "../models/site.ts";
import { getPublishedPosts } from "../models/post.ts";

export default async function () {
  const site = await getSite();
  const posts = await getPublishedPosts();

  const rssItems: Array<RssItem> = [];
  const rss: RSS = {
    rss: {
      attributes: { version: "2.0" },
      channel: {
        title: "Posts",
        description: site.description,
        link: `${site.host}/posts.rss`,
        copyright: site.author,
        item: rssItems,
      },
    },
  };

  for (const post of posts) {
    if (!post.datePublished) continue;

    const link = `${site.host}/posts/${post.slug}/`;

    rssItems.push({
      title: post.title,
      link,
      guid: link,
      pubDate: asRFC822Date(post.datePublished),
    });
  }

  /* create posts.rss */
  const builder = new XML.XMLBuilder({
    ignoreAttributes: false,
    attributesGroupName: "attributes",
  });

  return `<?xml version="1.0" encoding="UTF-8" ?>${builder.build(rss)}`;
}
