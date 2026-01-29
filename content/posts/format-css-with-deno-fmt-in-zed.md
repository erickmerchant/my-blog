+++
title = "Format CSS with Deno fmt in Zed"
datePublished = "2026-01-29"
content = ""
+++

Every day since I started using Deno and Zed together I've been battling a
[bugbear](https://www.dndbeyond.com/monsters/16817-bugbear). I want Deno to
format my CSS, but I could not for the life of me figure out how to get Zed to
use Deno for formatting CSS. So I'd save my CSS, and then later have Deno format
it differently.

I could have just added `deno fmt` to a hook that runs before committing. That
seems like a good step, but I don't really want code to change before
committing, and I don't want a commit to fail because something isn't formatted.
That's just more annoying things.

Every few weeks I'd fight this goblinoid annoyance, but it would hit me with
it's extra die of damage and I'd retreat. Well not tonight, because tonight I
finally won. 200 XP gained.

As far as I can tell this isn't entirely documented anywhere.

```json
{
  "CSS": {
    "formatter": {
      "external": {
        "command": "deno",
        "arguments": ["fmt", "--ext=css", "-"]
      }
    }
  }
}
```

The tricky detail here is the "-", signifying that the code is coming from
stdin. If you run `deno fmt --help` this is not mentioned as a possibility.
However in the docs it
[is mentioned](https://docs.deno.com/runtime/reference/cli/fmt/), and implies
that the output will be sent to stdout if used. Exactly what we need. Zed, if
you have "-" in the arguments for an external formatter seems to know to send
the buffer content to stdin, but again this isn't documented that I could find.
I just guessed that could be how it worked, and it worked.

Obviously this works for anything that both Deno and Zed support, so I'm using
it for Markdown as I type this so I won't be annoyed immediately after
publishing. Just remember to change the `--ext` bit to the relevant file
extension, because with the code coming from stdin, fmt can't tell what the
language is.
