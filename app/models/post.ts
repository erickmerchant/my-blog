import * as Toml from "@std/toml";
import * as Fs from "@std/fs";

export async function getPublishedPosts(): Promise<Array<Post>> {
	const posts: Array<Post> = [];

	for await (const { name, path } of Fs.expandGlob("./content/posts/*.md")) {
		const matched = name.match(/(.*?)\.md/);

		if (!matched) continue;

		const [, slug] = matched;
		const text = await Deno.readTextFile(path);
		const [, toml, md] = text.split("+++\n");
		const frontmatter: {
			title?: string;
			datePublished?: string;
		} = Toml.parse(toml);

		frontmatter.title ??= "Untitled";

		if (!Deno.args.includes("--dev") && frontmatter.datePublished == null) {
			continue;
		}

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

			if (!datePublished) continue;
		}

		const components: Array<string> = [];

		if (/`/.test(md)) components.push("code");

		if (/\n```/.test(md)) components.push("highlighting");

		const content = md;
		const post: Post = {
			slug,
			content,
			components,
			datePublished,
			title,
		} as Post;

		posts.push(post);
	}

	posts.sort((a, b) => {
		if (!a.datePublished) return -1;
		if (!b.datePublished) return 1;

		return Temporal.PlainDate.compare(b.datePublished, a.datePublished);
	});

	return posts;
}
