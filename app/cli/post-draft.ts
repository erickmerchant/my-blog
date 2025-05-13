import { slugify } from "@std/text/unstable-slugify";
import * as Toml from "@std/toml";

const title = Deno.args.join("");
const slug = slugify(title);
const frontmatter = Toml.stringify({
  title,
});
const data = `+++\n${frontmatter}+++\n`;

await Deno.writeTextFile(`content/posts/${slug}.md`, data);
