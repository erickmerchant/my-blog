import * as Toml from "@std/toml";
import * as Markdown from "../utils/markdown.ts";

export type Site = {
  host: string;
  title: string;
  author: string;
  description: string;
  projects: Array<Project>;
  bio: string;
  unfound: string;
};

export type Project = {
  href: string;
  title: string;
  content: string;
};

export async function getSite(): Promise<Site> {
  /* create site model */
  const siteContent = await Deno.readTextFile("./content/site.toml");
  const site = Toml.parse(siteContent) as Site;

  site.bio = await Markdown.parse(site.bio);
  site.unfound = await Markdown.parse(site.unfound);

  for (const project of site.projects) {
    project.content = await Markdown.parse(project.content);
  }

  return site;
}
