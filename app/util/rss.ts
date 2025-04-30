import * as XML from "fast-xml-parser";

export async function saveRSS(rss: RSS) {
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
