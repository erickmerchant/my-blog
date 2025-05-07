import {h, unsafe} from "../h.js";

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
	html,
} = h.html;

function timeline({title, items, note}) {
	return section.class("timeline")(
		header.class("timeline-header")(h2(title), span.class("note")(note)),
		ol.class("timeline-items")(
			items.map((item) =>
				li(
					div.class("details")(
						h3.class("title")(
							item.latestFullTime && span.class("note")("★"),
							item.title
						),
						item.organization && p.class("organization")(item.organization),
						p.class("dates")(item.dates[0] + "-" + item.dates[1]),
						item.location && p.class("location")(item.location)
					),
					item.tags &&
						item.tags.length &&
						ul.class("tags")(item.tags.map((tag) => li(tag))),
					div.class("summary")(unsafe(item.summary))
				)
			)
		)
	);
}

export default function ({resume}) {
	return html.lang("en-US")(
		head(
			meta.charset("utf-8"),
			meta.name("viewport").content("width=device-width, initial-scale=1"),
			title("Résumé"),
			link.href("/resume.css").rel("stylesheet"),
			meta.name("description").content("My résumé")
		),
		body.class("page")(
			div.class("layout")(
				header.class("header")(
					h1(resume.name),
					ul.class("contacts")(
						resume.contacts.map((contact) =>
							li(a.href(contact.href)(contact.text))
						)
					)
				),
				section.class("objective")(unsafe(resume.objective)),
				timeline({
					title: "Employment History",
					items: resume.history,
					note: "★ = Latest full-time role",
				}),
				timeline({
					title: "Education",
					items: resume.education,
				}),
				section.class("references")(p("References available upon request"))
			)
		)
	);
}
