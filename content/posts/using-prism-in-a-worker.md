+++
title = "Using Prism in a Worker"
datePublished = "2025-11-23"
+++

If you get an error that says
`Uncaught (in worker "") SyntaxError: "[object Object]" is not valid JSON` while
trying to use Prism in a Worker, I've got an easy fix that may work for you. I'm
using Deno and using Prism in `markdown-it`, but I don't think those details are
actually significant.

I was using the following, which works fine in dev (using Flint), but then when
I go to deploy my site I use Workers in the build process to render most of the
site to be static and the whole thing blows up.

```typescript
import MarkdownIt from "markdown-it";
import prism from "markdown-it-prism";
import "prismjs/components/prism-clike.js";
import "prismjs/components/prism-markup.js";
import "prismjs/components/prism-css.js";
import "prismjs/components/prism-javascript.js";
import "prismjs/components/prism-typescript.js";
import "prismjs/components/prism-rust.js";
import "prismjs/components/prism-docker.js";
import "prismjs/components/prism-bash.js";

export function parse(markdown: string): string {
  const md = new MarkdownIt();

  md.use(prism, {});

  return md.render(markdown);
}
```

Changing it to the following fixes the problem.

```typescript
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
```

I don't actually know the details of why this works, except Prism also uses
Workers I believe, but this is the second time I've fixed this, having done it
previously with `marked` as the markdown library, so I'm hoping this saves
myself having to solve it again or someone else that just got this error and
doesn't know what to do.
