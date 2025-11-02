import * as Fs from "@std/fs";
import * as Path from "@std/path";
import * as Toml from "@std/toml";
import { slugify } from "@std/text/unstable-slugify";

if (import.meta.main) {
  const title = Deno.args.join("");
  const slug = slugify(title);
  const frontmatter = Toml.stringify({
    title,
  });
  const code = `+++\n${frontmatter}+++\n`;
  const path = `content/posts/${slug}.md`;

  await Fs.ensureDir(Path.dirname(path));

  await Deno.writeTextFile(path, code);
}
