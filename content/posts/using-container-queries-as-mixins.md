+++
title = "Using container queries as mixins"
datePublished = "2024-01-28"
+++

[Mixins](https://sass-lang.com/documentation/at-rules/mixin/) are a thing that's
kind of missing from CSS. I found an interest way to get mixin type
functionality from container queries. To be clear this is a total hack, but it
could be useful.

## An example

```html
<style>
  p {
    color: red;
  }

  .large-blue {
    container: blue large / inline-size;
  }

  * {
    @container blue (min-width: 0) {
      color: blue;
    }

    @container large (min-width: 0) {
      font-weight: bold;
      font-size: 2em;
    }
  }
</style>

<div>
  <p>red</p>
</div>
<div class="large-blue">
  <p>blue</p>
</div>
```

So the major limitation is that since it is a container query you can't target
the parent. Notice that there are divs wrapping paragraphs.
[Style Queries](https://developer.chrome.com/docs/css-ui/style-queries) would
allow this for real, but that also has the same limitation.
