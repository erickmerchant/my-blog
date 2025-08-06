+++
title = "Introducing vanilla-kit"
datePublished = "2024-07-01"
+++

```javascript
import { $, children, classes, html, on, watch } from "vanilla-kit";

let { button } = html;
let target = document.getElementById("app");
let state = watch({ count: 0 });

$(target).children(
  button()
    .classes("counter-button", {
      "not-clicked": () => state.count === 0,
      "clicked": () => state.count > 0,
    })
    .on("click", () => {
      state.count += 1;
    })
    .children(
      () => `clicked ${state.count} ${state.count === 1 ? " time" : " times"}`,
    ),
);
```

I'd like to introduce
[vanilla-kit](https://github.com/erickmerchant/vanilla-kit). It is a tiny — ~1kb
minified and compressed — lib for creating or modifying the DOM. It uses a
fluent interface that for anyone who has used jQuery will seem familiar. You
indicate places that will need to update when state changes through the use of
plain functions. These become effects. Instead of modifying the DOM in event
handlers you modify state. Then any effects that read that state get rerun.
Standard stuff these days.

Most places where a primitive would be accepted, a function is also accepted
that returns the value. Then the setting of an attribute, rendering of a child,
and so on, become effects that will be called again when needed. I've created
[a CodePen](https://codepen.io/erickmerchant/pen/mdgLMxJ?editors=0010) with an
example so you can see what I'm talking about. There are only a few reactive
points, but you should get the idea.

You can grab it from
[Github via jsDelivr](https://cdn.jsdelivr.net/gh/erickmerchant/vanilla-kit@~2.3.0/lib.min.js)
and add it to your import map.

It is designed to be sprinkled as well. Where as most libraries or frameworks
want to control everything, vanilla-kit comes with a `$` method that you
typically would call `children` from to mount your app into the body or a div,
but you could also just make some classes reactive or say add some event
handlers. It would be great to just do those little things with js that need to
be done for accessibility.

Don't use it in production quite yet. It doesn't even have tests, and there is a
lot that I need to analyze related to memory and CPU usage. Preliminary analysis
looks good though.
