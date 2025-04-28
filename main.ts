import "./setup.ts";
import * as Fs from "@std/fs";
import * as Toml from "@std/toml";
import * as Marked from "marked";
import NotFoundView from "./templates/not_found.ts";
import PostView from "./templates/post.ts";
import HomeView from "./templates/home.ts";
import ResumeView from "./templates/resume.ts";

if (import.meta.main) {
  await Fs.ensureDir("./dist");
  await Fs.emptyDir("./dist");
  await Fs.copy("./public", "./dist", {
    overwrite: true,
    preserveTimestamps: true,
  });

  const siteContent = await Deno.readTextFile("./content/site.toml");
  const site = Toml.parse(siteContent) as Site;

  for (let project of site.projects) {
    project.description = await Marked.parse(project.description);
  }

  site.bio = await Marked.parse(site.bio);

  const notFoundHTML = toHTML(NotFoundView({ site }));

  await Deno.writeTextFile("./dist/404.html", notFoundHTML);

  const posts: Array<Post> = [];

  for await (const { name, path } of Fs.expandGlob("./content/posts/*.md")) {
    const matched = name.match(/(.*?)\.md/);

    if (!matched) continue;

    const [, slug] = matched;
    const text = await Deno.readTextFile(path);
    const [, toml, md] = text.split("+++\n");
    const frontmatter = Toml.parse(toml);

    frontmatter.date_published = frontmatter.date_published !== null
      ? new Date(frontmatter.date_published as string)
      : null;

    const content = await Marked.parse(md);
    const post: Post = {
      slug,
      content,
      ...frontmatter,
    } as Post;

    posts.push(post);

    const postHTML = toHTML(PostView({ site, post }));

    await Fs.ensureDir(`./dist/posts/${slug}`);

    await Deno.writeTextFile(`./dist/posts/${slug}/index.html`, postHTML);
  }

  const homeHTML = toHTML(HomeView({ site, posts }));

  await Deno.writeTextFile(`./dist/index.html`, homeHTML);

  const resumeContent = await Deno.readTextFile("./content/resume.toml");
  const resume = Toml.parse(resumeContent) as Resume;

  resume.objective = await Marked.parse(resume.objective);

  for (const r of resume.education) {
    r.summary = await Marked.parse(r.summary);
  }

  for (const r of resume.history) {
    r.summary = await Marked.parse(r.summary);
  }

  const resumeHTML = toHTML(ResumeView({ resume }));

  await Fs.ensureDir(`./dist/resume`);
  await Deno.writeTextFile(`./dist/resume/index.html`, resumeHTML);
}

function toHTML(el: HandcraftElement) {
  return `<!doctype html>${el.deref().innerHTML}`;
}
