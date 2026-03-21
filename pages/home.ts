import { each, fragment as ƒ, h, when } from "@handcraft/lib/templating";
import page from "./page.ts";
import { getSite, Project } from "../models/site.ts";
import { getPublishedPosts } from "../models/post.ts";

const { section, h1, h2, p, ol, ul, li, a, aside } = h.html;

export default async function () {
  const site = await getSite();
  const posts = await getPublishedPosts();

  return page(() => ({
    site,
    bannerTitle: h1,
    mainContent: [
      when(() => posts.length > 0).show(() =>
        section.class("section")(
          h2("Posts"),
          ol.class("list")(
            posts.map((post) =>
              li(
                a.class("title").href("/posts/" + post.slug + "/")(post.title),
              )
            ),
          ),
        )
      ),
      when(() => site.projects.length > 0).show(() =>
        section.class("section")(
          h2("Projects"),
          p("Some open-source projects."),
          ul.class("list")(
            each<Project>(site.projects).map((project) =>
              li(
                a.class("title").href(project.href)(project.title),
                ƒ.html(project.content),
              )
            ),
          ),
        )
      ),
      aside.class("section")(
        h2("About"),
        ƒ.html(site.bio),
      ),
    ],
  }));
}
