import { HandcraftElement, html, svg } from "handcraft/prelude/all.js";

const { head, body, meta, title, link, nav, span, a, footer, ul, li } = html;
const { title: svgTitle, path } = svg;

type Props = {
  site: Site;
  page_title?: string;
  styles?: HandcraftElement | null | [HandcraftElement | null];
  scripts?: HandcraftElement | null | [HandcraftElement | null];
  nav_title?: HandcraftElement | null | [HandcraftElement | null];
  main?: HandcraftElement | null | [HandcraftElement | null];
};

export default function ({
  site,
  page_title,
  styles,
  scripts,
  nav_title,
  main,
}: Props) {
  return html().attr("lang", "en-US").append(
    head().append(
      meta().attr("charset", "utf-8"),
      meta().attr("name", "viewport").attr(
        "content",
        "width=device-width, initial-scale=1",
      ),
      title().text(page_title ? page_title + " - " + site.title : site.title),
      link().attr("rel", "preconnect").attr("href", "https://fonts.bunny.net"),
      link().attr("rel", "stylesheet").attr("href", "/page.css"),
      styles,
      link().attr("rel", "stylesheet").attr(
        "href",
        "https://fonts.bunny.net/css?family=jacquard-24:400|work-sans:200,400,600,800",
      ),
      scripts,
      meta().attr("name", "description").attr(
        "content",
        site.description,
      ),
      link().attr("rel", "alternate")
        .attr("type", "application/rss+xml")
        .attr("title", "Posts")
        .attr("href", site.host + "/posts.rss"),
    ),
    body().classes("page").append(
      nav().classes("nav").append(
        nav_title ?? span().classes("nav-title").text(site.title),
        a().classes("nav-link").attr("href", "/").text("/"),
      ),
      main,
      footer().classes("footer").append(
        ul().classes("footer-list").append(
          li().classes("footer-item").append(
            a().classes("footer-link", "rss-link").attr("href", "/posts.rss")
              .append(
                svg().attr("viewBox", "0 0 28 28").append(
                  svgTitle().text("RSS Feed"),
                  path().attr(
                    "d",
                    "M0 24 A4 4 0 1 1 8 24 A4 4 0 1 1 0 24 Z M0 11 Q0 10 1 10 Q18 10 18 27 Q18 28 17 28 H13 Q12 28 12 27 Q12 16 1 16 Q0 16 0 15 Z M0 1 Q0 0 1 0 Q28 0 28 27 Q28 28 27 28 H23 Q22 28 22 27 Q22 6 1 6 Q0 6 0 5 Z",
                  ),
                ),
              ),
          ),
          li().classes("footer-item").append(
            a().classes("footer-link").attr(
              "href",
              "https://github.com/erickmerchant/my-blog",
            ).text("View Source"),
          ),
          li().classes("footer-item").text("©" + site.author),
        ),
      ),
    ),
  );
}
