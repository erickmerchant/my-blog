import type { Resume } from "../types.ts";
import * as Toml from "@std/toml";

export async function getResume(): Promise<Resume> {
  const resumeContent = await Deno.readTextFile("./src/content/resume.toml");
  const resume = Toml.parse(resumeContent) as Resume;

  return resume;
}
