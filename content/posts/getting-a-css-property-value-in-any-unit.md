+++
title = "Getting a CSS property's value in any units"
date = "2024-01-27"
tags = ["javascript", "css"]
+++

<blockquote class="interstitial">
	<p>Is there a way to convert between units in CSS using browser js <em>stuffs</em>?</p>
	<footer>
		<cite>ginger, chief meme officer</cite>
	</footer>
</blockquote>

The other day ginger in the Shoptalk Show Discord had an interesting question, "Is there a way to convert between units in CSS using browser js <em>stuffs</em>?". And an example given was:

```js
const styles = getComputedStyle($0);
console.log(styles.fontSize) // 1rem;
const fontSizeInPx = CSS.px(styles.fontSize) // 16px
```

I didn't really get involved in the conversation, but immediately thought of `@property` and how that might be able to help. The next morning I opened up CodePen and tried to get a rough idea working of a function that would convert between units. A perfect activity after dropping my daughter off at daycare, to do while I drank my morning coffee. This is the <a href="https://codepen.io/erickmerchant/pen/RwdjbeQ?editors=0010">result</a>, a function I call `getPropertyValueInUnits` which you pass an element, a property you want the value of, and the units you want the value in. Also there is an optional namespace.

```js
function getPropertyValueInUnits(el, prop, units, ns = "units") {
  if (!el) return;

  try {
    window.CSS.registerProperty({
      name: `--${units}-${ns}`,
      syntax: "<length>",
      inherits: false,
      initialValue: "1px"
    });
  } catch (e) {}

  el.style.setProperty(`--${units}-${ns}`, `1${units}`);

  let computed = window.getComputedStyle(el);
  let base = computed.getPropertyValue(`--${units}-${ns}`);

  base = base.substring(0, base.length - 2); // remove px from the end

  let val = computed.getPropertyValue(prop);

  val = val.substring(0, val.length - 2); // remove px from the end

  return val / base;
}
```

The basic idea is that you set a custom property to 1 of the unit you want, by which you get the base. Then you get the value of the property. Divide that value by the base and you get the result in the desired units. You need to remove "px" from the end of both first too before doing the division, because `getPropertyValue` gives you a string with the units at the end.

But here is the trick, before doing any of this you need to call `window.CSS.registerProperty` and register the custom property that gives you the base. See alone a custom property will return as sort of unevaluated or as authored, but define it first and it will return in px like any other length property.

## Some caveats

- It's wrapped in a try catch so that you can call this multiple times with the same units. There is no way currently to get a list of properties defined this way.
- There should probably be validation of some sort.
- Ironically the property in units that people talked about the most, font-size in ems won't really work, because font-size in ems will always be 1 with this function, but you can look at the immediate parent element, get the value of font-size there in pixels and compare it to the font-size in pixels on the element you care about.
- Also sadly this doesn't work in Firefox at the moment, but it <a href="https://caniuse.com/?search=registerProperty">soon probably will</a>.
