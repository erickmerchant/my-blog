import type { HandcraftNode, HandcraftTag } from "@handcraft/lib";
import { html } from "@handcraft/lib/h";
import attr from "@handcraft/lib/attr";
import text from "@handcraft/lib/text";
import { type Site } from "../models/site.ts";
import favicons from "./favicons.ts";

type Config = {
  site: Site;
  pageTitle?: string;
  bannerTitle?: HandcraftTag;
  headElements?: Array<HandcraftNode>;
  mainContent: Array<HandcraftNode>;
};

export default function (
  {
    site,
    pageTitle,
    bannerTitle,
    mainContent,
    headElements = [
      html.link(attr.rel("stylesheet"), attr.href("/styles/main.css")),
    ],
  }: Config,
) {
  const baseHead = html.head(
    html.meta(attr.charset("utf-8")),
    html.meta(attr.name("viewport"), attr.content("width=device-width")),
    html.title(text(pageTitle ? pageTitle + " - " + site.title : site.title)),
    html.link(
      attr.rel("preload"),
      attr.href("/fonts/nunito-900-normal-latin-0eaa4a42.woff2"),
      attr.as("font"),
      attr.type("font/woff2"),
      attr.crossorigin(""),
    ),
    html.link(
      attr.rel("preload"),
      attr.href("/fonts/figtree-300-900-normal-latin-abff9c58.woff2"),
      attr.as("font"),
      attr.type("font/woff2"),
      attr.crossorigin(""),
    ),
    ...headElements,
    html.link(
      attr.rel("alternate"),
      attr.type("application/rss+xml"),
      attr.title("Posts"),
      attr.href(site.host + "/posts.rss"),
    ),
    ...favicons(),
    html.meta(attr.name("description"), attr.content(site.description)),
  );
  const banner = html.header(
    attr.class("banner"),
    (bannerTitle ?? html.span)(
      attr.class("title"),
      html.a(attr.href("/"), text(site.title)),
    ),
  );
  const baseFooter = html.footer(
    attr.class("footer"),
    html.ul(
      attr.class("list"),
      html.li(attr.class("item"), text("© " + site.author)),
      html.li(
        attr.class("item"),
        html.a(
          attr.class("link"),
          attr.href("https://github.com/erickmerchant/my-blog"),
          text("View Source"),
        ),
      ),
      html.li(
        attr.class("item"),
        html.a(
          attr.class("link rss"),
          attr.href("/posts.rss"),
          html.span(attr.class("rss-icon")),
          text("RSS"),
        ),
      ),
    ),
  );
  const baseBody = html.body(
    banner,
    html.main(attr.class("main"), ...mainContent, baseFooter),
  );

  return html.html(attr.lang("en-US"), baseHead, baseBody);
}
