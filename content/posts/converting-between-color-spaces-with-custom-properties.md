+++
title = "Converting between color spaces with custom properties"
# date_published = "2025-02-23"
+++

This is about writing a function to convert between color spaces in the browser.

Last year I wrote ["Getting a CSS property's value in any units"](/posts/getting-a-css-property-value-in-any-units/), a trick you can do to get a CSS property in any units. The post never mentions it but I probably should have specified that it's for properties that are a length. Recently I found another cool trick that again involves defining a custom property, but this time with colors. Again I got nerd-sniped by something posted in the Shoptalk Show Discord.

<blockquote class="callout">
	<p>This isn't wildly interesting but it did seem like a good opportunity for a micro web component <a href="https://codepen.io/chriscoyier/pen/ZYzdgNN?editors=1010">https://codepen.io/chriscoyier/pen/ZYzdgNN?editors=1010</a>.</p>
	<p>What I'd like to try is to have the text input accept input as well (in any format) and reflect the color back into the color input. But that might require color.js or something.</p>
	<footer>
		<cite>Chris Coyier</cite>
	</footer>
</blockquote>

So you can look at his CodePen and my [fork](https://codepen.io/erickmerchant/pen/JoPgGQY). What I came up with uses a custom property, so we are working with a color, and then the `color` function to coerce the value to a new color space — in this case rgb. Then I do some regex and map stuff to take the value and turn it into a hex code that the color input uses.

What might be interesting though is if we had a function like `getPropertyValueInUnits` from my previous post to convert any color to a new color space. Let's call it `convertColor`. What might be
