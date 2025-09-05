+++
title = "A base Custom Element for Declarative Shadow Dom"
datePublished = "2023-06-04"
+++

## Declarative Shadow DOM

I think Shadow Dom is useful. Even without Custom Elements it can be useful.
It's the only real way to partition HTML off. Without it an HTML document is
just a blob of… everything. Sure you can add classes to things, but I'd argue
`<page-nav>` is a much better way to actually have a page nav than
`<div class="page-nav">`. Also up until now it was the only real way to scope
CSS to an element. Soon you'll be able to do that with `@scope` in CSS, but who
knows when that will be supported cross browser.

However for a long time the only way to use Shadow DOM was through JS. With
Declarative Shadow DOM you can now declare shadow trees directly in static HTML.
I'm a big fan of this. I think at the very least for sites that are not "web
applications" this could be useful. I generate it with jinja templates myself. I
have just a bit of JS on my site.

## The conundrum

It does pose a problem though. If you need JS, how do you use a web framework.
You will likely end up shipping instructions on generating the same markup you
already have in your HTML, likely via JSX.

This is where a base Custom Element for Declarative Shadow Dom comes in. I'm
going to use my own element.js used on this site as an example, but this is more
a list of features I think you want in such a Custom Element. Also to be clear
when I say base element I mean a class that all your other Custom Elements would
extend.

## The features

### No duplicate HTML

We don't want to ship our shadow tree in two places. You could use, for example,
JSX to output your Declarative Shadow DOM and then also have that compiled into
`h` or `createElement` or whatever in your JS. I believe we shouldn't do this.
This one is kind of hard to show in element.js, since it's the absence of code.

### Reactive state

We need reactive state. When the state changes, the UI updates without having to
manually keep track of what changes need to happen with which state changes.

With element.js I have a `watch` method.

```javascript
import { Element, watch } from "element";

class ExampleElement extends Element {
  #state = watch({ count: 0 });

  *setupCallback() {
    this.shadowRoot.getElementById("button")?.addEventListener("click", () => {
      this.#state.count++;
    });

    yield () => {
      this.shadowRoot.getElementById("output")?.innerHTML = this.#state.count;
    };
  }
}

customElements.define("example-element", ExampleElement);
```

In the example above I have `#state` that uses `watch`. In `*setupCallback` is
where we declare our DOM changes. At the top we can declare event listeners.
Anything in a function returned from `yield` is a DOM update. The base element
in element.js keeps track of what state is accessed with each, so when for
instance count is incremented it knows to do the change in the example without
having to manually call that. I think in the front end web world JSX has become
synonymous with declarative, but really things like CSS, and this setupCallback
are also declarative. As long as we say what our UI should be, but not when it
should be, it's declarative.

Also worth noting that `setupCallback` doesn't have to be a generator. It could
be a regular function that returns an array of functions. I just like generators
for this.

### Polyfill Declarative Shadow DOM

Declarative Shadow DOM isn't supported in Firefox at the time of writing, so if
you want to support that browser you should polyfill it. You can do that in your
base element.

In element.js I have the following.

```javascript
let firstChild = this.firstElementChild;
let mode = firstChild?.getAttribute("shadowrootmode");

if (!this.shadowRoot && firstChild?.nodeName === "TEMPLATE" && mode) {
  this.attachShadow({ mode }).appendChild(firstChild.content.cloneNode(true));

  firstChild.remove();
}
```

### Two way data binding to attributes

This last one is probably the one that you could take or leave. It's nice to
have attributes behave like any other watched state, but also have your base
element handle updating attributes when that state is changed by you.

```javascript
import { Element } from "element";

class ExampleElement extends Element {
  static get observedAttributeDefaults() {
    return { count: 0 };
  }

  *setupCallback() {
    this.shadowRoot.getElementById("button")?.addEventListener("click", () => {
      this.count++;
    });

    yield () => {
      this.shadowRoot.getElementById("output")?.innerHTML = this.count;
    };
  }
}

customElements.define("example-element", ExampleElement);
```

Here I've converted the state to use `observedAttributeDefaults`, which
internally calls `watch` and populates `observedAttributes` for us. Now when we
increment count, an attribute called count on our `<example-element>` will
update, and if we change that attribute externally the innerHTML of our output
element in our shadow tree will update.

## Conclusion

So four features I think a base element for Declarative Shadow DOM should have.

- No duplicate HTML
- Reactive state
- Polyfill Declarative Shadow DOM
- Two way data binding to attributes

I'll likely be packaging up element.js and shipping it to a place where others
can use it. I'll update this post if I do.
