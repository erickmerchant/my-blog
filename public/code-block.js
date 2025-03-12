import "handcraft/dom/classes.js";
import "handcraft/dom/observe.js";
import {define} from "handcraft/define.js";
import {effect} from "handcraft/reactivity.js";

define("code-block").connected((host) => {
	let observer = host.observe();
	let lines = observer.find("code");

	effect(() => {
		for (let line of lines) {
			if (/^\s*\/\//.test(line.deref().textContent)) {
				line.classes("highlight");
			}
		}
	});
});
