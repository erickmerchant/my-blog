+++
title = "@erickmerchant/html-render: a tiny lib for declarative ui"
date = "2024-04-08"
+++

I'd like to introduce [@erickmerchant/html-render](https://jsr.io/@erickmerchant/html-render) (or html-render). It is a tiny — ~1.4 kb minified and compressed — lib for creating UI in HTML. It uses a fluent interface that for anyone who has used jQuery will seem familiar. The difference is that with html-render you are not querying the DOM, you are creating it. You indicate places that will need to update when state changes through the use of plain functions. These become effects. Instead of modifying the DOM in event handlers you modify state. Then any effects that read that state get rerun.

Most places where a primitive would be accepted, a function is also accepted that returns the value. Then the setting of an attribute, rendering of a child, et cetera, become effects that will be called again when needed. I've created [a CodePen](https://codepen.io/erickmerchant/pen/KKYoyKK?editors=0010) with an example so you can see what I'm talking about.

I don't expect the world to suddenly switch from the likes of React and Vue to this. However jQuery is still massively used, and also I'm sure there are others out there like me that always felt quite a bit more productive using it. The goal here is to give a similar API, but eliminate the source of truth problem by using a similar reactive API to Vue's.

It is published to JSR so you could use it with a bundler, or you could grab it from [Github via jsDelivr](https://cdn.jsdelivr.net/gh/erickmerchant/html-render@~0.12.0/lib.min.js) and add it to an import map. I prefer the latter because it doesn't require a build step. If you do use a bundler though it's potentially less code, because it is fully tree-shakeable.

Finally I will point out that this is alpha or maybe beta. Either way don't use it in production yet. It doesn't even have tests yet, and there is a lot that I need to analyze related to memory and cpu usage. Preliminary analysis look good though. But disclaimer aside, I have a few examples that I've developed and used (find them in the [examples directory](https://github.com/erickmerchant/html-render/tree/main/examples)), and it does work.

## Some features I have planned

- Rename to something else. I've been kicking around declare-observe-mutate or D.O.M.
- Tests using Deno DOM.
- Cross publish to NPM.
- Provide a module that has `mixin` called already with everything. Perhaps also all html/svg tags exported.
- I want a `text` method and had it, but removed it because I couldn't decide what it should do if there are already children. I still can't decide, but having text makes the three projects I already have more readable.
- Hydration. This should be easy but complicated. Essentially build queries instead of elements, and then delay all chained method work. Revert to building when the DOM doesn't match so this will also involve reconciliation. It will be a separate lib, and the complication mostly is how to tap into the main lib.
- Types. This will likely never be rewritten to TypeScript, but it should have types for IDE's.
