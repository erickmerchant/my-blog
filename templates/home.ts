import { html, unsafe } from "handcraft/prelude/all.js";
import base from "./base.ts";

const { section, h1, h2, p, ol, ul, li, a, aside, link } = html;

type Props = {
  site: Site;
  posts: Array<Post>;
};

export default function ({ site, posts }: Props) {
  return base({
    site,
    nav_title: h1().classes("nav-title").text(site.title),
    styles: link().attr("rel", "stylesheet").attr("href", "/home.css"),
    main: [
      posts.length
        ? section().classes("section").append(
          h2().text("Posts"),
          ol().classes("section-list").append(
            posts.map((post) =>
              li().classes("section-item").append(
                a().classes("title").attr("href", "/posts/" + post.slug + "/")
                  .text(
                    post.title,
                  ),
              )
            ),
          ),
        )
        : null,
      site.projects.length
        ? section().classes("section").append(
          h2().text("Projects"),
          p().text("Some open-source projects."),
          ol().classes("section-list").append(
            site.projects.map((project) =>
              li().classes("section-item").append(
                a().classes("title").attr("href", project.href)
                  .text(
                    project.title,
                  ),
                unsafe(project.description),
              )
            ),
          ),
        )
        : null,
      aside().classes("section").append(h2().text("About"), unsafe(site.bio)),
    ],
  });
}
