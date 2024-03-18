+++
title = "Using container queries as mixins"
date = "2024-01-28"
+++

<a href="https://sass-lang.com/documentation/at-rules/mixin/">Mixins</a> are a thing that's kind of missing from CSS. What if I told you that mixins can be accomplished with container queries? That sounds like a hack and it's probably pretty ugly you'd say. Yes, but it's sort of interesting.

## An example

### The HTML

``` html
<div>
  <p>red</p>
</div>
<div class="large-blue">
  <p>blue</p>
</div>
```

### The CSS

``` css
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
```

So this works, but the major limitation is that since it is a container query you can't target the parent. Notice that there are divs wrapping paragraphs. <a href="https://developer.chrome.com/docs/css-ui/style-queries">Style Queries</a> would allow this for real, but that also has the same limitation.
