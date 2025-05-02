import * as Toml from "@std/toml";
import * as Marked from "marked";

export async function getSite(): Promise<Site> {
  /* create site model */
  const siteContent = await Deno.readTextFile("./content/site.toml");
  const site = Toml.parse(siteContent) as Site;

  for (const project of site.projects) {
    project.description = await Marked.parse(project.description);
  }

  site.bio = await Marked.parse(site.bio);

  return site;
}
