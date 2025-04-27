import {raw} from "../main.ts";
import {Base} from "./base.tsx";

type Props = {
	site: Site;
	posts: [Post];
	bio: string;
};

export function Home({site, posts, bio}: Props) {
	return (
		<>
			<Base site={site} title={<h1 class="nav-title">{site.title}</h1>}>
				{posts.length && (
					<section class="section">
						<h2>Posts</h2>
						<ol class="section-list">
							{posts.map((post) => (
								<li class="section-item">
									<a class="title" href={"/posts/" + post.slug + "/"}>
										{post.title}
									</a>
								</li>
							))}
						</ol>
					</section>
				)}

				{site.projects.length && (
					<section class="section">
						<h2>Projects</h2>
						<p>Some open-source projects.</p>
						<ul class="section-list">
							{site.projects.map((project) => (
								<li class="section-item">
									<a class="title" href={project.href}>
										{project.title}
									</a>
									{raw(project.description)}
								</li>
							))}
						</ul>
					</section>
				)}

				<aside class="section">
					<h2>About</h2>
					{raw(bio)}
				</aside>
			</Base>
		</>
	);
}
