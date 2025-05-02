import { html, unsafe } from "handcraft/prelude/all.js";

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
  span,
  title,
  ul,
} = html;

function timeline({
  title,
  items,
  note,
}: {
  title: string;
  items: [ResumeItem];
  note?: string;
}) {
  return section().classes("timeline").append(
    header().classes("timeline-header").append(
      h2().text(title),
      span().classes("note").text(note),
    ),
    ol().classes("timeline-items").append(
      items.map((item) =>
        li().append(
          div().classes("details").append(
            h3().classes("title").append(
              item.latest_full_time && span().classes("note").text("★"),
              item.title,
            ),
            item.organization &&
              p().classes("organization").text(item.organization),
            p().classes("dates").text(item.dates[0] + "-" + item.dates[1]),
            item.location && p().classes("location").text(item.location),
          ),
          item.tags && item.tags.length &&
            ul().classes("tags").append(
              item.tags.map((tag) => li().text(tag)),
            ),
          div().classes("summary").append(unsafe(item.summary)),
        )
      ),
    ),
  );
}

type Props = {
  resume: Resume;
};

export default function ({ resume }: Props) {
  return html().attr("lang", "en-US").append(
    head().append(
      meta().attr("charset", "utf-8"),
      meta().attr("name", "viewport").attr(
        "content",
        "width=device-width, initial-scale=1",
      ),
      title().text("Résumé"),
      link()
        .attr("href", "/resume.css")
        .attr("rel", "stylesheet"),
      meta().attr("name", "description").attr("content", "My résumé"),
    ),
    body().classes("page").append(
      div().classes("layout").append(
        header().classes("header").append(
          h1().text(resume.name),
          ul().classes("contacts").append(
            resume.contacts.map((contact) =>
              li().append(
                a().attr("href", contact.href).text(contact.text),
              )
            ),
          ),
        ),
        section().classes("objective").append(unsafe(resume.objective)),
        timeline({
          title: "Employment History",
          items: resume.history,
          note: "★ = Latest full-time role",
        }),
        timeline({
          title: "Education",
          items: resume.education,
        }),
        section().classes("references").append(
          p().text("References available upon request"),
        ),
      ),
    ),
  );
}
