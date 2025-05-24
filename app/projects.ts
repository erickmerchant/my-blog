import * as Path from "@std/path";
import * as Fs from "@std/fs";
import { command } from "./utils/command.ts";

export async function embedProjects() {
  await Fs.ensureDir("./dist/projects");

  await command`git clone --single-branch -b handcraft-new-syntax git@github.com:erickmerchant/memory.git ./dist/projects/memory`();

  await command`deno install --entrypoint ./memory-game.js`(
    Path.join(Deno.cwd(), "dist/projects/memory/"),
  );

  for await (
    const { path, name, isSymlink } of Fs.expandGlob(
      "./dist/projects/memory/node_modules/*",
      {
        followSymlinks: false,
      },
    )
  ) {
    if (name.startsWith(".")) continue;

    if (isSymlink) {
      const realpath = await Deno.realPath(path);

      await Deno.remove(path, { recursive: true });

      await Fs.move(realpath, path);
    }
  }

  for await (
    const { path, name } of Fs.expandGlob(
      "./dist/projects/memory/node_modules/*",
      {
        followSymlinks: false,
      },
    )
  ) {
    if (name.startsWith(".")) await Deno.remove(path, { recursive: true });
  }
}
