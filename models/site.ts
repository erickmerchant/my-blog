import * as Toml from "@std/toml";
import * as Markdown from "../utils/markdown.ts";
import { type HandcraftNode } from "@handcraft/lib";

export type Site = {
  host: string;
  title: string;
  author: string;
  description: string;
  projects: Array<Project>;
  bio: Array<HandcraftNode | string>;
};

export type Project = {
  href: string;
  title: string;
  content: Array<HandcraftNode | string>;
};

export async function getSite(): Promise<Site> {
  /* create site model */
  const siteContent = await Deno.readTextFile("./content/site.toml");
  const site = Toml.parse(siteContent) as Site;

  site.bio = Markdown.parse(site.bio as unknown as string);

  for (const project of site.projects) {
    project.content = Markdown.parse(project.content as unknown as string);
  }

  return site;
}
