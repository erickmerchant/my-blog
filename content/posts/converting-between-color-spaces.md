+++
title = "Converting between color spaces with custom properties"
datePublished = "2025-03-12"
+++

Last year I wrote
["Getting a CSS property's value in any units"](/posts/getting-a-css-property-value-in-any-units/),
a trick you can do to get a CSS property in any units. The post never mentions
it, but I probably should have specified that it's for properties that are a
length. Recently I found another cool trick that again involves defining a
custom property, but this time with colors. Again I got nerd-sniped by something
posted in the Shoptalk Show Discord.

> This isn't wildly interesting but it did seem like a good opportunity for a
> micro web component
> [https://codepen.io/chriscoyier/pen/ZYzdgNN?editors=1010](https://codepen.io/chriscoyier/pen/ZYzdgNN?editors=1010).
> What I'd like to try is to have the text input accept input as well (in any
> format) and reflect the color back into the color input. But that might
> require color.js or something.
>
> — Chris Coyier

So you can look at his CodePen and my
[fork](https://codepen.io/erickmerchant/pen/JoPgGQY). What I came up with uses a
custom property, so we are working with a color, and then the `color` function
to coerce the value to a new color space — in this case rgb. Then I do some
regex and map stuff to take the value and turn it into a hex code that the color
input uses.

Let me highlight the relevant bits of js.

```javascript
import { css, LitElement } from "https://esm.sh/lit";

export class ColorInput extends LitElement {
  static {
    // This is important so that the value that we later set is cast to an actual color and not just stored as a string.
    window.CSS.registerProperty({
      name: "--color-input-value",
      syntax: "<color>",
      inherits: false,
      initialValue: "#000000",
    });
  }

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();

    const label = this.querySelector("label");
    const colorInput = this.querySelector("input");
    const textInput = document.createElement("input");

    label.insertAdjacentElement("afterend", textInput);

    colorInput.addEventListener("input", () => {
      textInput.value = colorInput.value;
    });

    textInput.addEventListener("input", () => {
      // This takes a string that is the input's value, and uses the color function in css to say take this value and convert it into srgb.
      textInput.style.setProperty(
        "--color-input-value",
        `color(from ${textInput.value} srgb r g b)`,
      );

      const style = window.getComputedStyle(textInput);
      const value = style.getPropertyValue("--color-input-value");

      // Now we have an rgb color. But it's not a hex and color inputs use hex, so now we have to grab the first three numbers out of that with a regex match — only three because color inputs don't support opacity — and use that to produce a hex value.
      const numbers = value.match(/[0-9\.]+/g);

      colorInput.value = `#${
        numbers
          .slice(0, 3)
          .map((n) =>
            Math.floor(Number(n) * 255)
              .toString(16)
              .padStart(2, "0")
          )
          .join("")
      }`;
    });
  }
}
customElements.define("color-input", ColorInput);
```

- We register a custom property `--color-input-value` with
  `window.CSS.registerProperty`. This is important so that the value that we
  later set is cast to an actual color and not just stored as a string.
- Then when the input changes we set the custom property on an element. I used
  the input, but it doesn't matter where really. We set it to
  `color(from ${textInput.value} srgb r g b)`. This takes a string that is the
  input's value, and uses the `color` function in css to say take this value and
  convert it into srgb.
- Now we have an rgb color. But it's not a hex and color inputs use hex, so now
  we have to grab the first three numbers out of that with a regex match — only
  three because color inputs don't support opacity — and use that to produce a
  hex value. I did not test this cross browser and I suspect that if there is
  anywhere it might fail even in browsers that support custom properties, it
  might be this step. I could imagine a browser stringifying an rgb as a hex
  instead of the `rgb` functional notation. Why wouldn't they? Hex values are
  older than that notation.

Custom properties, and the newish `color` function are really powerful, and when
you use css and js together you can do cool things.
