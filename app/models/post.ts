import * as Toml from "@std/toml";
import * as Marked from "marked";
import * as Fs from "@std/fs";

export async function getAllPosts(): Promise<Array<Post>> {
  const posts: Array<Post> = [];

  for await (const { name, path } of Fs.expandGlob("./content/posts/*.md")) {
    const matched = name.match(/(.*?)\.md/);

    if (!matched) continue;

    const [, slug] = matched;
    const text = await Deno.readTextFile(path);
    const [, toml, md] = text.split("+++\n");
    const frontmatter = Toml.parse(toml);

    frontmatter.date_published = frontmatter.date_published !== null
      ? new Date(frontmatter.date_published as string)
      : null;

    let hasCode = 0;

    if (/`/.test(md)) hasCode++;

    if (/\n```/.test(md)) hasCode++;

    const content = await Marked.parse(md);
    const post: Post = {
      slug,
      content,
      hasCode,
      ...frontmatter,
    } as Post;

    posts.push(post);
  }

  posts.sort((a, b) => {
    return b.date_published.getTime() - a.date_published.getTime();
  });

  return posts;
}
