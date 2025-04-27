function TimeLine({
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
				<h2>{title}</h2> <span class="note">{note}</span>
			</header>
			<ol class="timeline-items">
				{items.map((item) => (
					<li>
						<div class="details">
							<h3 class="title">
								{item.latest_full_time && <span class="note">★</span>}
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
						<div class="summary">{{__html: item.summary}}</div>
					</li>
				))}
			</ol>
		</section>
	);
}

type Props = {
	resume: Resume;
};

export default function ({resume}: Props) {
	return (
		<html lang="en">
			<head>
				<meta charset="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<title>Résumé</title>
				<link rel="preconnect" href="https://fonts.bunny.net" />
				<link
					href="https://fonts.bunny.net/css?family=bitter:700|work-sans:400,400i,700"
					rel="stylesheet"
				/>
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
					<section class="objective">{{__html: resume.objective}}</section>
					<TimeLine
						title="Employment History"
						items={resume.history}
						note="★ = Latest full-time role"
					/>
					<TimeLine title="Education" items={resume.education} />
					<section class="references">
						<p>References available upon request</p>
					</section>
				</div>
			</body>
		</html>
	);
}
