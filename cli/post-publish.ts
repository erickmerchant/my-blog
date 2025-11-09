import * as Fs from "@std/fs";
import * as Path from "@std/path";
import * as Toml from "@std/toml";

import { parseArgs } from "@std/cli/parse-args";

const helpText = `
publish a post (set its datepublished)

--path   the path to the post relative to the cwd
`;

if (import.meta.main) {
  const flags = parseArgs(Deno.args, {
    boolean: ["help"],
    string: ["path"],
    alias: {
      h: "help",
    },
  });

  if (!flags.help && flags.path != null && flags.path != "") {
    const path = flags.path;
    const text = await Deno.readTextFile(path);
    const [, toml, md] = text.split("+++\n");
    const parsed: {
      title?: string;
      datePublished?: string;
    } = Toml.parse(toml);

    parsed.datePublished = Temporal.Now.plainDateISO().toString();

    const frontmatter = Toml.stringify(parsed);
    const code = `+++\n${frontmatter}+++\n${md}`;

    await Fs.ensureDir(Path.dirname(path));

    await Deno.writeTextFile(path, code);

    Deno.exit(0);
  } else {
    console.log(helpText);

    Deno.exit(1);
  }
}
