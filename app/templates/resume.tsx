import {h, unsafe} from "../../jsx.js";

function Timeline({
	title,
	items,
	note,
}: {
	title: string;
	items: [ResumeItem];
	note?: string;
}) {
	return (
		<section class="timeline">
			<header class="timeline-header">
				<h2>{title}</h2>
				<span class="note">{note}</span>
			</header>
			<ol class="timeline-items">
				{items.map((item) => (
					<li>
						<div class="details">
							<h3 class="title">
								{item.latestFullTime && <span class="note">★</span>}
								{item.title}
							</h3>
							{item.organization && (
								<p class="organization">{item.organization}</p>
							)}
							<p class="dates">{item.dates[0] + "-" + item.dates[1]}</p>
							{item.location && <p class="location">{item.location}</p>}
						</div>
						{item.tags && item.tags.length && (
							<ul class="tags">
								{item.tags.map((tag) => (
									<li>{tag}</li>
								))}
							</ul>
						)}
						<div class="summary">{unsafe(item.summary)}</div>
					</li>
				))}
			</ol>
		</section>
	);
}

type Props = {
	resume: Resume;
};

export function ResumeView({resume}: Props) {
	return (
		<html lang="en-US">
			<head>
				<meta charset="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<title>Résumé</title>
				<link href="/resume.css" rel="stylesheet" />
				<meta name="description" content="My résumé" />
			</head>
			<body class="page">
				<div class="layout">
					<header class="header">
						<h1>{resume.name}</h1>
						<ul class="contacts">
							{resume.contacts.map((contact) => (
								<li>
									<a href={contact.href}>{contact.text}</a>
								</li>
							))}
						</ul>
					</header>
					<section class="objective">{unsafe(resume.objective)}</section>
					<Timeline
						title="Employment History"
						items={resume.history}
						note="★ = Latest full-time role"
					/>
					<Timeline title="Education" items={resume.education} />
					<section class="references">
						<p>References available upon request</p>
					</section>
				</div>
			</body>
		</html>
	);
}
