import * as Fs from "@std/fs";
import * as Path from "@std/path";
import * as Toml from "@std/toml";
import { slugify } from "@std/text/unstable-slugify";
import { parseArgs } from "@std/cli/parse-args";

const helpText = `
create a new post in draft state (no datepublished)

--title   the title of the post. it will be slugified
`;

if (import.meta.main) {
  const flags = parseArgs(Deno.args, {
    boolean: ["help"],
    string: ["title"],
    alias: {
      h: "help",
    },
  });

  if (!flags.help && flags.title != null && flags.title != "") {
    const title = flags.title;
    const slug = slugify(title);
    const frontmatter = Toml.stringify({
      title,
    });
    const code = `+++\n${frontmatter}+++\n`;
    const path = `content/posts/${slug}.md`;

    await Fs.ensureDir(Path.dirname(path));

    await Deno.writeTextFile(path, code);

    Deno.exit(0);
  } else {
    console.log(helpText);

    Deno.exit(1);
  }
}
