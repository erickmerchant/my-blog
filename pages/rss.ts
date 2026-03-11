import { Rss } from "@feed/feed";
import { getSite } from "../models/site.ts";
import { getPublishedPosts } from "../models/post.ts";

type RssItem = {
  title: string;
  link: string;
  guid: string;
  pubDate: string;
};

export type RSS = {
  rss: {
    attributes: { version: string };
    channel: {
      title: string;
      description: string;
      link: string;
      copyright: string;
      item: Array<RssItem>;
    };
  };
};

export default async function () {
  const site = await getSite();
  const posts = await getPublishedPosts();

  const firstPost = posts[0];

  const rssFeed = new Rss({
    title: site.title,
    description: site.description,
    link: `${site.host}/posts.rss`,
    updated: firstPost
      ? new Date(firstPost.datePublished.toString())
      : new Date(),
    id: `${site.host}/posts.rss`,
    authors: [],
    copyright: site.author,
  });

  for (const post of posts) {
    const link = `${site.host}/posts/${post.slug}/`;

    rssFeed.addItem({
      title: post.title,
      link,
      id: link,
      updated: new Date(post.datePublished.toString()),
      description: "Description for RSS item 1",
      content: {
        body: "Content for RSS item 1",
        type: "html",
      },
    });
  }

  return rssFeed.build();
}
