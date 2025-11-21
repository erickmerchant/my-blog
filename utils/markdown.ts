import MarkdownIt from "markdown-it";
import prism from "markdown-it-prism";

import "prismjs/components/prism-bash.js";
import "prismjs/components/prism-clike.js";
import "prismjs/components/prism-markup.js";
import "prismjs/components/prism-css.js";
import "prismjs/components/prism-javascript.js";
import "prismjs/components/prism-typescript.js";
import "prismjs/components/prism-docker.js";
import "prismjs/components/prism-rust.js";

const md = new MarkdownIt();

md.use(prism);

export async function parse(markdown: string): Promise<string> {
  return await md.render(markdown);
}
