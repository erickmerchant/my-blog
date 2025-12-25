import * as Toml from "@std/toml";
import * as Fs from "@std/fs";

export type Post = {
  slug: string;
  title: string;
  datePublished: Temporal.PlainDate;
  content: string;
};

export async function getPublishedPosts(): Promise<Array<Post>> {
  const posts: Array<Post> = [];

  for await (const { name } of Fs.expandGlob("./content/posts/*.md")) {
    const matched = name.match(/(.*?)\.md/);

    if (!matched) continue;

    const [, slug] = matched;
    const post = await getPostBySlug(slug);

    if (post) {
      posts.push(post);
    }
  }

  posts.sort((a, b) => {
    return Temporal.PlainDate.compare(b.datePublished, a.datePublished);
  });

  return posts;
}

export async function getPostBySlug(slug?: string) {
  if (!slug) return;

  const path = `./content/posts/${slug}.md`;
  const text = await Deno.readTextFile(path);
  const [, toml, md] = text.split("+++\n");
  const frontmatter: {
    title?: string;
    datePublished?: string;
  } = Toml.parse(toml);

  frontmatter.title ??= "Untitled";

  const title = frontmatter.title;
  let datePublished: Temporal.PlainDate | undefined;

  if (frontmatter.datePublished) {
    const splitDatePublished: Array<number> = frontmatter.datePublished
      .split("-")
      .map((s) => Number(s));

    if (splitDatePublished.length === 3) {
      datePublished = new Temporal.PlainDate(
        ...(splitDatePublished as [number, number, number]),
      );
    }
  }

  const content = md;
  const post: Post = {
    slug,
    content,
    datePublished,
    title,
  } as Post;

  return post;
}

export async function getPostURLs() {
  const posts = await getPublishedPosts();

  return posts.map((post) => "/posts/" + post.slug + "/");
}
