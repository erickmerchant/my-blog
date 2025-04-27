import Base from "./base.tsx";

type Props = {
	site: Site;
};

export default function ({site}: Props) {
	return (
		<Base
			site={site}
			page_title="404 Not Found"
			styles={<link rel="stylesheet" href="/post.css" />}>
			<article class="article">
				<h1>404 Not Found</h1>
				<p>The thing you're looking for can not be located.</p>
			</article>
		</Base>
	);
}
