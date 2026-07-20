import { type Site } from "../models/site.ts";
import { h, type HandcraftChild, type HandcraftNode } from "@handcraft/lib";
import favicons from "./favicons.ts";
import { icon as rssIcon } from "@erickmerchant/icons/rss";

type Config = {
  site: Site;
  pageTitle?: string;
  bannerTitle?: HandcraftNode;
  headElements?: Array<HandcraftChild>;
  mainContent: Array<HandcraftChild>;
};

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

export default function (
  {
    site,
    pageTitle,
    bannerTitle,
    mainContent,
    headElements = [link.rel("stylesheet").href("/styles/main.css")],
  }: Config,
) {
  const baseHead = head(
    meta.charset("utf-8"),
    meta.name("viewport").content("width=device-width, initial-scale=1"),
    title(pageTitle ? pageTitle + " - " + site.title : site.title),
    link
      .rel("preload")
      .href("/fonts/bitter-100-900-normal-latin.woff2")
      .as("font")
      .type("font/woff2")
      .crossorigin(""),
    ...headElements,
    link
      .rel("alternate")
      .type("application/rss+xml")
      .title("Posts")
      .href(site.host + "/posts.rss"),
    favicons(),
    meta.name("description").content(site.description),
  );
  const baseNav = header.class("banner")(
    (bannerTitle ?? span)().class("title")(
      a.href("/")(site.title),
    ),
  );
  const baseFooter = footer.class("footer")(
    ul.class("list")(
      li.class("item")("© " + site.author),
      li.class("item")(
        a
          .class("link")
          .href("https://github.com/erickmerchant/my-blog")("View Source"),
      ),
      li.class("item")(
        a
          .class("link rss")
          .href("/posts.rss")(rssIcon()),
      ),
    ),
  );
  const baseBody = body(
    main.class("main")(baseNav, ...mainContent, baseFooter),
  );

  return html.lang("en-US")(baseHead, baseBody);
}
