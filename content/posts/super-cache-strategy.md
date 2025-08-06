+++
title = "Super cache strategy"
datePublished = "2023-08-01"
+++

For a long time etags were the beginning and end of cache headers that I would
set when writing a server. It's sibling, `cache-control`, sort of eluded me. I
knew about using it with cache busting techniques, but I never did it. Recently
it finally dawned on me how to combine `etag` with `cache-control` headers and
cache busting.

The strategy is fairly simple. I can't be the first person to do this, but I
have never heard it explained as the following.

- Use an `etag` header for `text/html` responses
- Use a `cache-control` header with a `max-age=31536000` (one year which is the
  recommended max) set for everything else that has a cache busting url like
  your js and css.

This way in an ideal situation, with a warm cache, the browser just requests the
html and receives a `304` status code. Everything else gets served from the
cache and is a `200`.
