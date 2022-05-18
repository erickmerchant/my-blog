<?xml version="1.0" encoding="utf-8"?>
<!--

# Pretty Feed

Styles an RSS/Atom feed, making it friendly for humans viewers, and adds a link
to aboutfeeds.com for new user onboarding. See it in action:

   https://interconnected.org/home/feed


## How to use

1. Download this XML stylesheet from the following URL and host it on your own
   domain (this is a limitation of XSL in browsers):

   https://github.com/genmon/aboutfeeds/blob/main/tools/pretty-feed-v3.xsl

2. Include the XSL at the top of the RSS/Atom feed, like:

```
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet href="/PATH-TO-YOUR-STYLES/pretty-feed-v3.xsl" type="text/xsl"?>
```

3. Serve the feed with the following HTTP headers:

```
Content-Type: application/xml; charset=utf-8  # not application/rss+xml
x-content-type-options: nosniff
```

(These headers are required to style feeds for users with Safari on iOS/Mac.)



## Limitations

- Styling the feed *prevents* the browser from automatically opening a
  newsreader application. This is a trade off, but it's a benefit to new users
  who won't have a newsreader installed, and they are saved from seeing or
  downloaded obscure XML content. For existing newsreader users, they will know
  to copy-and-paste the feed URL, and they get the benefit of an in-browser feed
  preview.
- Feed styling, for all browsers, is only available to site owners who control
  their own platform. The need to add both XML and HTTP headers makes this a
  limited solution.


## Credits

pretty-feed is based on work by lepture.com:

   https://lepture.com/en/2019/rss-style-with-xsl

This current version is maintained by aboutfeeds.com:

   https://github.com/genmon/aboutfeeds


## Feedback

This file is in BETA. Please test and contribute to the discussion:

     https://github.com/genmon/aboutfeeds/issues/8

-->
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>Posts | <xsl:value-of select="/rss/channel/title"/></title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
        <style type="text/css">
          * {
            font: inherit;
            color: inherit;
            box-sizing: border-box;
            max-width: 100%;
            padding: 0;
            margin: 0;
          }

          html {
            font: 300 125% / 1.5 system-ui, -apple-system;
          }

          nav {
            background: hsl(60 90% 90%);
            padding-block: 2rem 3rem;
            margin-block-end: 1rem;
            font-size: 0.8rem;
          }

          nav ~ *, nav > * {
            max-width: 40rem;
            margin-inline: auto;
            padding-inline: 2rem;
          }

          header {
            margin-block: 3rem;
          }

          a {
            color: hsl(200 60% 40%);
            text-underline-offset: 0.2rem;
            text-decoration-thickness: 0.1rem;
          }

          h1 {
            font-weight: 900;
          }

          h2 {
            font-weight: 800;
          }

          h3 {
            font-weight: 700;
          }

          h4 {
            font-weight: 600;
          }

          h1, h2, h3, h4, p {
            margin-block-start: 1rem;
          }

          article p:last-child {
            font-style: italic;
            font-size: 0.8rem;
            margin-block-start: 0.5rem;
          }

          strong {
            font-weight: 600;
          }

          body > :last-child {
            font-size: 0.8rem;
            margin-block-start: 3rem;
          }

        </style>
      </head>
      <body>
        <nav>
          <p>
            This is an <strong>RSS feed</strong>. Subscribe by copying the URL from the address bar into your newsreader.
          </p>
          <p>
            Visit <a href="https://aboutfeeds.com">About Feeds</a> to get started with newsreaders and subscribing. It’s free.
          </p>
        </nav>
        <header>
          <h1><xsl:value-of select="/rss/channel/title"/></h1>
          <p><xsl:value-of select="/rss/channel/description"/></p>
          <p>
            <a>
              <xsl:attribute name="href">
                <xsl:value-of select="/rss/channel/link"/>
              </xsl:attribute>
              Visit Website &#x2192;
            </a>
          </p>
        </header>
        <h3>Posts</h3>
        <xsl:for-each select="/rss/channel/item">
          <article>
            <h4>
              <a>
                <xsl:attribute name="href">
                  <xsl:value-of select="link"/>
                </xsl:attribute>
                <xsl:value-of select="title"/>
              </a>
            </h4>
            <p>
              Published: <xsl:value-of select="pubDate" />
            </p>
          </article>
        </xsl:for-each>
        <p><xsl:value-of select="/rss/channel/copyright"/></p>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
