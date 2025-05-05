import {escape} from "@std/html";

export const Fragment = Symbol("fragment");

export function h(tag, attributes, ...children) {
	if (tag === Fragment) {
		return children;
	}

	if (typeof tag === "string") {
		return {tag, attributes, children};
	}

	return tag(attributes, ...children);
}

const unsafes = new Map();

export function unsafe(content) {
	const symbol = Symbol("unsafe");

	unsafes.set(symbol, content);

	return symbol;
}

const voidElements = [
	"area",
	"base",
	"br",
	"col",
	"embed",
	"hr",
	"img",
	"input",
	"link",
	"meta",
	"param",
	"source",
	"track",
	"wbr",
];

export function render(input) {
	if (typeof input === "symbol" && unsafes.has(input))
		return unsafes.get(input);

	if (typeof input !== "object") return escape(`${input}`);

	if (Array.isArray(input)) {
		let result = "";

		for (const i of input) {
			if (!i) continue;

			result += render(i);
		}

		return result;
	}

	if (input.tag) {
		if (input.tag === Fragment) return render(input.children);

		if (typeof input.tag === "function") {
			return render(tag(input.attributes, ...[].concat(input.children)));
		}

		input.attributes ??= {};

		let attributes = "";

		for (const [key, val] of Object.entries(input.attributes)) {
			if (val === true) attributes += ` ${key}`;
			else if (val) {
				attributes += ` ${key}="${escape(val)}"`;
			}
		}

		if (voidElements.includes(input.tag)) {
			return `<${input.tag}${attributes}>`;
		}

		return `<${input.tag}${attributes}>${render(input.children)}</${
			input.tag
		}>`;
	}

	return input;
}
