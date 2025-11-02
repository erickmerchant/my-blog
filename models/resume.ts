import * as Toml from "@std/toml";

export type ResumeItem = {
  title: string;
  organization?: string;
  dates: [string, string];
  location?: string;
  tags?: Array<string>;
  summary: string;
};

export type Resume = {
  name: string;
  contacts: Array<
    {
      href: string;
      text: string;
    }
  >;
  objective: string;
  history: Array<ResumeItem>;
  education: Array<ResumeItem>;
};

export async function getResume(): Promise<Resume> {
  const resumeContent = await Deno.readTextFile("./content/resume.toml");
  const resume = Toml.parse(resumeContent) as Resume;

  return resume;
}
