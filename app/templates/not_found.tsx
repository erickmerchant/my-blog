import {h} from "../../jsx.js";
import {BaseView} from "./base.tsx";

type Props = {
	site: Site;
};

export function NotFoundView({site}: Props) {
	return (
		<BaseView
			site={site}
			pageTitle="404 Not Found"
			styles={<link rel="stylesheet" href="/post.css" />}
			main={
				<article class="article">
					<h1>404 Not Found</h1>
					<p>The thing you're looking for can not be located.</p>
				</article>
			}
		/>
	);
}
