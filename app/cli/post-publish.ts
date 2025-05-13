import * as Toml from "@std/toml";

const file = Deno.args[0];
const text = await Deno.readTextFile(file);
const [, toml, md] = text.split("+++\n");
const parsed: {
  title?: string;
  datePublished?: string;
} = Toml.parse(toml);

parsed.datePublished = (Temporal.Now.plainDateISO()).toString();

const frontmatter = Toml.stringify(parsed);
const data = `+++\n${frontmatter}+++\n${md}`;

Deno.writeTextFile(file, data);
