import * as Fs from "@std/fs";

if (import.meta.main) {
	await Fs.ensureDir("./dist");

	await Fs.emptyDir("./dist");
}
