import type { FlintRouteContext } from "@flint/framework";
import type { ResumeItem } from "../types.ts";
import { h, render } from "@handcraft/lib";
import * as Markdown from "../utils/markdown.ts";
import favicons from "./favicons.ts";
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

export default async function ({ resolve }: FlintRouteContext) {
  const resume = await getResume();

  return render(
    html.lang("en-US")(
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
          section.class("objective").html(
            await Markdown.parse(resume.objective),
          ),
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
    ),
  );
}

async function timeline(
  { title, items }: { title: string; items: Array<ResumeItem> },
) {
  return section.class("timeline")(
    header.class("timeline-header")(h2(title)),
    ol.class("timeline-items")(
      await Promise.all(
        items.map(async (item) =>
          li(
            div.class("details")(
              h3.class("title")(item.title),
              item.organization
                ? p.class("organization")(item.organization)
                : null,
              p.class("dates")(item.dates[0] + "-" + item.dates[1]),
              item.location ? p.class("location")(item.location) : null,
            ),
            item.tags &&
              item.tags.length
              ? ul.class("tags")(item.tags.map((tag) => li(tag)))
              : null,
            div.class("summary").html(await Markdown.parse(item.summary)),
          )
        ),
      ),
    ),
  );
}
