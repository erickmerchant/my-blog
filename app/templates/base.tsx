import {h} from "../../jsx.js";

type Props = {
	site: Site;
	pageTitle?: string;
	styles?: any;
	scripts?: any;
	navTitle?: any;
	main?: any;
};

export function BaseView({
	site,
	pageTitle,
	styles,
	scripts,
	navTitle,
	main,
}: Props) {
	const baseHead = (
		<head>
			<meta charset="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<title>{pageTitle ? pageTitle + " - " + site.title : site.title}</title>
			<link rel="stylesheet" href="/page.css" />
			{styles}
			{scripts}
			<link
				rel="alternate"
				type="application/rss+xml"
				title="Posts"
				href={site.host + "/posts.rss"}
			/>
			<meta name="description" content={site.description} />
		</head>
	);

	const baseNav = (
		<nav class="nav">
			{navTitle ?? <span class="nav-title">{site.title}</span>}
			<a class="nav-link" href="/">
				/
			</a>
		</nav>
	);

	const baseFooter = (
		<footer class="footer">
			<ul class="footer-list">
				<li class="footer-item">
					<a class="footer-link rss-link" href="/posts.rss">
						<svg viewBox="0 0 28 28">
							<title>RSS Feed</title>
							<path d="M0 24 A4 4 0 1 1 8 24 A4 4 0 1 1 0 24 Z M0 11 Q0 10 1 10 Q18 10 18 27 Q18 28 17 28 H13 Q12 28 12 27 Q12 16 1 16 Q0 16 0 15 Z M0 1 Q0 0 1 0 Q28 0 28 27 Q28 28 27 28 H23 Q22 28 22 27 Q22 6 1 6 Q0 6 0 5 Z"></path>
						</svg>
					</a>
				</li>
				<li class="footer-item">
					<a
						class="footer-link"
						href="https://github.com/erickmerchant/my-blog">
						View Source
					</a>
				</li>
				<li class="footer-item">© {site.author}</li>
			</ul>
		</footer>
	);

	const baseBody = (
		<body class="page">
			{baseNav}
			{main}
			{baseFooter}
		</body>
	);

	return (
		<html lang="en-US">
			{baseHead}
			{baseBody}
		</html>
	);
}
