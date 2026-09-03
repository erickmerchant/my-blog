import { each, h, when } from "@handcraft/lib";
import page from "./page.ts";
import { getSite, Project } from "../models/site.ts";
import { getPublishedPosts } from "../models/post.ts";
import { asLocalDate } from "../utils/dates.ts";

const { section, h1, h2, ol, ul, li, a, aside, p } = h.html;

export default async function () {
  const site = await getSite();
  const posts = await getPublishedPosts();

  return page({
    site,
    bannerTitle: h1,
    mainContent: [
      when(() => posts.length > 0).show(() =>
        section.class("section")(
          h2("Posts"),
          ol.class("list")(
            posts.map((post) =>
              li(
                p(
                  a.class("title").href("/posts/" + post.slug + "/")(
                    post.title,
                  ),
                ),
                p.class("date")(
                  asLocalDate(post.datePublished as Temporal.PlainDate),
                ),
              )
            ),
          ),
        )
      ),
      when(() => site.projects.length > 0).show(() =>
        section
          .class("section")(
            h2("Projects"),
            ul.class("list")(
              each<Project>(site.projects).map((project) =>
                li(
                  p(a.class("title").href(project.href)(project.title)),
                  ...project.content,
                )
              ),
            ),
          )
      ),
      aside.class("section")(
        h2("About"),
        ...site.bio,
      ),
    ],
  });
}
