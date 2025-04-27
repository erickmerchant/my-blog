import Base from "./base.tsx";

type Props = {
	site: Site;
	post: Post;
};

export default function ({site, post}: Props) {
	return (
		<Base
			site={site}
			page_title={post.title}
			styles={
				<>
					<link rel="stylesheet" href="/post.css" />
					<link rel="stylesheet" href="/vendor/prism.css" />
				</>
			}>
			scripts={<script src="/vendor/prism.js"></script>}
			<article class="article">
				<header>
					<h1>{post.title}</h1>
					{post.date ? (
						<time class="status">
							{post.date.getFullYear() +
								"-" +
								("0" + (post.date.getMonth() + 1)).slice(-2) +
								"-" +
								post.date.getDate()}
						</time>
					) : (
						<span class="status">Draft</span>
					)}
				</header>

				{{__html: post.content}}
			</article>
		</Base>
	);
}
