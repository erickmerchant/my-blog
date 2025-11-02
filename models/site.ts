import * as Toml from "@std/toml";

export type Site = {
  host: string;
  title: string;
  author: string;
  description: string;
  projects: Array<Project>;
  bio: string;
};

type Project = {
  href: string;
  title: string;
  description: string;
};

export async function getSite(): Promise<Site> {
  /* create site model */
  const siteContent = await Deno.readTextFile("./content/site.toml");
  const site = Toml.parse(siteContent) as Site;

  return site;
}
