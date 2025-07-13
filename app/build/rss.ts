import * as XML from "fast-xml-parser";
import { asRFC822Date } from "../utils/dates.ts";

export async function saveRSS(
	{ site, posts }: { site: Site; posts: Array<Post> },
) {
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
	const rssContent = builder.build(rss);

	await Deno.writeTextFile(
		`./dist/posts.rss`,
		`<?xml version="1.0" encoding="utf-8"?>${rssContent}`,
	);
}
