import * as Toml from "@std/toml";
import * as Marked from "marked";

export async function getResume(): Promise<Resume> {
  const resumeContent = await Deno.readTextFile("./content/resume.toml");
  const resume = Toml.parse(resumeContent) as Resume;

  resume.objective = await Marked.parse(resume.objective);

  for (const r of resume.education) {
    r.summary = await Marked.parse(r.summary);
  }

  for (const r of resume.history) {
    r.summary = await Marked.parse(r.summary);
  }

  return resume;
}
