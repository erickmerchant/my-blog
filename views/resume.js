import { h, render } from "handcraft/env/server.js";
import * as Markdown from "../utils/markdown.ts";
import favicons from "./favicons.js";
import { getResume } from "../models/resume.ts";

const {
  a,
  body,
  div,
  h1,
  h2,
  h3,
  head,
  header,
  li,
  link,
  meta,
  ol,
  p,
  section,
  title,
  ul,
  html,
} = h.html;

export default async function ({ resolve }) {
  const resume = await getResume();
  const doc = html.lang("en-US")(
    head(
      meta.charset("utf-8"),
      meta.name("viewport").content("width=device-width, initial-scale=1"),
      title("Résumé"),
      link.href(resolve("/resume.css")).rel("stylesheet"),
      favicons({ resolve }),
      meta.name("description").content("My résumé"),
    ),
    body.class("page")(
      div.class("layout")(
        header.class("header")(
          h1(resume.name),
          ul.class("contacts")(
            resume.contacts.map((contact) =>
              li(a.href(contact.href)(contact.text))
            ),
          ),
        ),
        section.class("objective")(await Markdown.parse(resume.objective)),
        await timeline({
          title: "Employment History",
          items: resume.history,
        }),
        await timeline({
          title: "Education",
          items: resume.education,
        }),
        section.class("references")(p("References available upon request")),
      ),
    ),
  );

  return render(doc);
}

async function timeline({ title, items }) {
  return section.class("timeline")(
    header.class("timeline-header")(h2(title)),
    ol.class("timeline-items")(
      await Promise.all(
        items.map(async (item) =>
          li(
            div.class("details")(
              h3.class("title")(item.title),
              item.organization && p.class("organization")(item.organization),
              p.class("dates")(item.dates[0] + "-" + item.dates[1]),
              item.location && p.class("location")(item.location),
            ),
            item.tags &&
              item.tags.length &&
              ul.class("tags")(item.tags.map((tag) => li(tag))),
            div.class("summary")(await Markdown.parse(item.summary)),
          )
        ),
      ),
    ),
  );
}
