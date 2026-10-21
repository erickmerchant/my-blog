import { html } from "@handcraft/lib/h";
import when from "@handcraft/lib/when";
import each from "@handcraft/lib/each";
import attr from "@handcraft/lib/attr";
import text from "@handcraft/lib/text";
import page from "./page.ts";
import { getSite, Project } from "../models/site.ts";
import { getPublishedPosts } from "../models/post.ts";
import { asLocalDate } from "../utils/dates.ts";

export default async function () {
  const site = await getSite();
  const posts = await getPublishedPosts();

  return page({
    site,
    bannerTitle: html.h1,
    mainContent: [
      when(() => posts.length > 0).show(() =>
        html.section(
          attr.class("section"),
          html.h2(text("Posts")),
          html.ol(
            attr.class("list"),
            ...posts.map((post) =>
              html.li(
                html.p(
                  html.a(
                    attr.class("title"),
                    attr.href("/posts/" + post.slug + "/"),
                    text(post.title),
                  ),
                ),
                html.p(
                  attr.class("date"),
                  text(asLocalDate(post.datePublished as Temporal.PlainDate)),
                ),
              )
            ),
          ),
        )
      ),
      when(() => site.projects.length > 0).show(() =>
        html.section(
          attr.class("section"),
          html.h2(text("Projects")),
          html.ul(
            attr.class("list"),
            each<Project>(site.projects).map((project) =>
              html.li(
                html.p(
                  html.a(
                    attr.class("title"),
                    attr.href(project.href),
                    text(project.title),
                  ),
                ),
                ...project.content,
              )
            ),
          ),
        )
      ),
      html.aside(attr.class("section"), html.h2(text("About")), ...site.bio),
    ],
  });
}
