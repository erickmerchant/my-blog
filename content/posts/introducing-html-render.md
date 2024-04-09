+++
title = "@erickmerchant/html-render: a tiny lib for declarative ui"
date = "2024-04-08"
+++

```javascript
import {
	html,
	watch,
	mixin,
	append,
	classes,
	on,
	text,
	$,
} from "@erickmerchant/html-render";

let {button} = html;
let target = document.getElementById("app");
let state = watch({count: 0});

mixin({append, classes, on, text});

$(target).append(
	button()
		.classes("counter-button", {
			"not-clicked": () => state.count === 0,
			"clicked": () => state.count > 0,
		})
		.on("click", () => {
			state.count += 1;
		})
		.text("clicked ", () => state.count, " times")
);
```

I'd like to introduce [@erickmerchant/html-render](https://jsr.io/@erickmerchant/html-render) (or html-render). It is a tiny — ~1.5 kb minified and compressed — lib for creating UI in HTML. It uses a fluent interface that for anyone who has used jQuery will seem familiar. The difference is that with html-render you are not querying the DOM, you are creating it. You indicate places that will need to update when state changes through the use of plain functions. These become effects. Instead of modifying the DOM in event handlers you modify state. Then any effects that read that state get rerun. Standard stuff these days.

Most places where a primitive would be accepted, a function is also accepted that returns the value. Then the setting of an attribute, rendering of a child, and so on, become effects that will be called again when needed. I've created [a CodePen](https://codepen.io/erickmerchant/pen/mdgLMxJ?editors=0010) with an example so you can see what I'm talking about. There are only a few reactive points, but you should get the idea.

It is published to JSR so you could use it with a bundler, or you could grab it from [Github via jsDelivr](https://cdn.jsdelivr.net/gh/erickmerchant/html-render@~0.13.0/lib.min.js) and add it to an import map. I prefer the latter because it doesn't require a build step. If you do use a bundler though it's potentially less code, because it is fully tree-shakeable. For instance if you don't use the `map` and `data` methods those could be tree shaken out.

It is designed to be sprinkled as well. Where as most libraries or frameworks want to control everything, html-render comes with a `$` method that you typically would call append from to mount your app into the body or a div, but you could also just make some classes on a website reactive. It would be great to just do those little things with js that need to be done for accessibility.

One of the main goals of html-render is to be used in web components. Especially light DOM only web components. In this use case you could tree shake to get only the methods you need and if you end up with some repeated code it would be very minimal. Large applications though you'd want to avoid any duplication and bundle. Both use cases are catered to.

Don't use it in production quite yet. It doesn't even have tests, and there is a lot that I need to analyze related to memory and cpu usage. Preliminary analysis looks good though. But disclaimer aside, I have a few examples that I've developed and used — find them in the [examples directory](https://github.com/erickmerchant/html-render/tree/main/examples) — and it does work.

## Some things I have planned

- Rename to something else. I've been kicking around declare-observe-mutate or D.O.M.
- Version 1.0.0 will depend on tests using Deno DOM and being cross-publish to NPM.
- Provide a module that has `mixin` called already with everything. Perhaps also all html/svg tags exported. This will primarily be used to get started and will be named "demo" so that that point is not forgotten.
- Hydration. This should be easy but complicated. Essentially build queries instead of elements, and then delay all chained method work. Revert to building when the DOM doesn't match so this will also involve reconciliation. It will be a separate module, and the complication mostly is how to tap into the main module.
- Types. This will likely never be rewritten to TypeScript, because I'm committed to keeping it small, but it should have types for IDE's.
- Allow string selectors in `$`
