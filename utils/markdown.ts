import MarkdownIt from "markdown-it";

export async function parse(markdown: string): Promise<string> {
  const { default: prism } = await import("markdown-it-prism");

  await import("prismjs/components/prism-clike.js");
  await import("prismjs/components/prism-markup.js");
  await import("prismjs/components/prism-css.js");
  await import("prismjs/components/prism-javascript.js");
  await import("prismjs/components/prism-typescript.js");
  await import("prismjs/components/prism-rust.js");
  await import("prismjs/components/prism-docker.js");
  await import("prismjs/components/prism-bash.js");

  const md = new MarkdownIt();

  md.use(prism, {});

  return md.render(markdown);
}
