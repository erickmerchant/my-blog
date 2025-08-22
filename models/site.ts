import type { Site } from "../types.ts";
import * as Toml from "@std/toml";

export async function getSite(): Promise<Site> {
  /* create site model */
  const siteContent = await Deno.readTextFile("./content/site.toml");
  const site = Toml.parse(siteContent) as Site;

  return site;
}
