import { each, fragment, h, when } from "@handcraft/lib";
import page from "./page.ts";
import * as Markdown from "../utils/markdown.ts";
import { getSite } from "../models/site.ts";
import { getPublishedPosts } from "../models/post.ts";

const { section, h1, h2, p, ol, ul, li, a, aside } = h.html;

export default async function () {
  const site = await getSite();
  const posts = await getPublishedPosts();

  return page
    .site(site)
    .bannerTitle(h1)
    .main([
      when(() => posts.length > 0).show(() =>
        section.class("section")(
          h2("Posts"),
          ol.class("section-list")(
            posts.map((post) =>
              li.class("section-item")(
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
          ul.class("section-list")(
            each(site.projects).map(async (project) =>
              li.class("section-item")(
                a.class("title").href(project.href)(project.title),
                fragment.html(await Markdown.parse(project.description)),
              )
            ),
          ),
        )
      ),
      aside.class("section")(
        h2("About"),
        fragment.html(await Markdown.parse(site.bio)),
      ),
    ])();
}
