import type { HandcraftChildArg, HandcraftElement } from "@handcraft/lib";
import type { Site } from "../models/site.ts";
import { h } from "@handcraft/lib";
import { render } from "@handcraft/lib/render";
import favicons from "./favicons.ts";

const {
  head,
  body,
  meta,
  title,
  link,
  header,
  span,
  a,
  footer,
  ul,
  li,
  html,
  main,
} = h.html;
const { title: svgTitle, path, svg } = h.svg;

export default function (
  {
    site,
    pageTitle,
    stylesheet = null,
    bannerTitle = span,
    mainContent,
  }: {
    site: Site;
    pageTitle?: HandcraftChildArg;
    stylesheet?: HandcraftChildArg;
    bannerTitle?: HandcraftElement;
    mainContent: Array<HandcraftChildArg>;
  },
) {
  const baseHead = head(
    meta.charset("utf-8"),
    meta.name("viewport").content("width=device-width, initial-scale=1"),
    title(pageTitle ? pageTitle + " - " + site.title : site.title),
    link.rel("preload")
      .href("/fonts/Bitter-VariableFont_wght-subset.woff2")
      .as("font")
      .type("font/woff2")
      .crossorigin(""),
    link.rel("stylesheet").href("/styles/page.css"),
    stylesheet,
    link
      .rel("alternate")
      .type("application/rss+xml")
      .title("Posts")
      .href(site.host + "/posts.rss"),
    favicons(),
    meta.name("description").content(site.description),
  );
  const baseNav = header.class("banner")(
    bannerTitle.class("banner-title")(
      a.href("/")(site.title),
    ),
  );
  const baseFooter = footer.class("footer")(
    ul.class("footer-list")(
      li.class("footer-item")("© " + site.author),
      li.class("footer-item")(
        a.class("footer-link").href("https://github.com/erickmerchant/my-blog")(
          "View Source",
        ),
      ),
      li.class("footer-item")(
        a.class("footer-link rss-link").href("/posts.rss")(
          svg.viewBox("0 0 28 28")(
            svgTitle("RSS Feed"),
            path.d(
              "M0 24 A4 4 0 1 1 8 24 A4 4 0 1 1 0 24 Z M0 11 Q0 10 1 10 Q18 10 18 27 Q18 28 17 28 H13 Q12 28 12 27 Q12 16 1 16 Q0 16 0 15 Z M0 1 Q0 0 1 0 Q28 0 28 27 Q28 28 27 28 H23 Q22 28 22 27 Q22 6 1 6 Q0 6 0 5 Z",
            ),
          ),
        ),
      ),
    ),
  );
  const baseBody = body(
    main.class("main")(baseNav, ...mainContent, baseFooter),
  );

  return render(html.lang("en-US")(baseHead, baseBody));
}
