+++
title = "JSX in Web Components"
datePublished = "2022-08-06"
+++

## How'd I get there

So as part of the recent rewrite of this site I decided to experiment with Web
Components. Or custom elements specifically. I had used Web Components at a
previous job, so they were not new to me, but I had not used them much
personally.

One decision I needed to make first is how to generate html. I will tell you
briefly what I tried, before I settled on JSX, and then I will explain briefly
how to do it.

First I tried tagged template literals. Going back as far as 2015 I have used
them and for a long time I had a
[framework](https://github.com/hyper-views/framework) that was very small — less
than 3kb — but for various reasons I wanted to see if I could go even more
minimal. Also [lit](https://lit.dev/) is more code than my own framework, so
that was not a contender.

Second I tried
[Declarative Shadow DOM](https://web.dev/declarative-shadow-dom/). This was
actually great. The problem I ran into with it was that to my surprise
Declarative Shadow DOM works without Javascript. That does make sense I guess,
but it means that combined with sparse support you have to support a matrix of
JS, no JS, support, and no support for styling. I may write more about that at
some point, because I will likely come back to Declarative Shadow DOM for
limited things. For instance the code blocks on this site perhaps where it makes
sense to do the syntax highlighting on the server, but I also want some
interactivity like toggling word wrapping which I had in this site's previous
iteration and have removed for this one.

So eventually I settled on the idea of using JSX. I should say right up front
that I have never been a fan of JSX. It's seemed unnecessary. We have template
literals after all, which have the advantage of being able to be cached where as
JSX is just function calls on every render. But JSX has a few advantages. First
support for it is built into everything basically: Babel, and more importantly
for me, SWC. Second, code editor support is great. It means I do not have to
install a plugin in VS Code just for syntax highlighting. A possible third
advantage to JSX is that I work with React at work now, so staying in that realm
for hobby stuff helps prevent context switching.

## How to

OK so how do we use JSX with Web Components? There are really just two steps
with an optional third.

1. Enable JSX compiling in whatever you are using. Babel, etc.
2. Define an `h` function.
3. Define a `Fragment` function if you use fragments.

For step 1, if you are using Babel you can use their
[JSX plugin](https://babeljs.io/docs/en/babel-plugin-transform-react-jsx) along
with setting runtime to `classic` and pragma to `h` and pragmaFrag to
`Fragment`.

And here is an example of `h` and `Fragment`. You just need to be sure to import
them or make sure they are defined wherever you use JSX.

```javascript
function h(tag, props, ...children) {
  children = children.flat(Infinity);

  if (typeof tag === "function") return tag({ ...props, children });

  let node = document.createElement(tag);

  for (let [key, val] of Object.entries(props ?? {})) {
    if (key.startsWith("on")) {
      node.addEventListener(key.substring(2).toLowerCase(), ...[].concat(val));
    } else {
      node[key] = val;
    }
  }

  node.append(...children);

  return node;
}

function Fragment({ children }) {
  return children;
}
```

My dream is the have a html tagged template function built into browsers, but in
the meantime as long as I'm using Babel, or similar, JSX is a pretty good
substitute
