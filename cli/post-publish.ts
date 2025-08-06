import * as Fs from "@std/fs";
import * as Path from "@std/path";
import * as Toml from "@std/toml";

if (import.meta.main) {
  const path = Deno.args[0];
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
}
