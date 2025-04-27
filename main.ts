import fs from "node:fs/promises";
import * as toml from "@std/toml";
import * as Marked from "marked";
import { NotFound } from "./templates/not_found.tsx";

export function raw(content: string) {
  return {
    __html: Marked.marked.parse(content),
  };
}

if (import.meta.main) {
  await fs.rmdir("./dist", { recursive: true }).catch(() => true);

  await fs.cp("./public", "./dist");

  const siteContent = await fs.readFile("./content/site.toml");

  const site = toml.parse(siteContent.toString()) as Site;

  const _404_page = await NotFound({ site });

  await fs.writeFile("./dist/404.html", _404_page);
}
