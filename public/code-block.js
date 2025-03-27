import "handcraft/dom/classes.js";
import "handcraft/dom/find.js";
import "handcraft/dom/text.js";
import {define} from "handcraft/define.js";

define("code-block").connected((host) => {
	let lines = host.find("code");

	for (let line of lines) {
		if (/^\s*\/\//.test(line.text())) {
			line.classes("highlight");
		}
	}
});
