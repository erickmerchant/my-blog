import * as Path from "@std/path";
import * as Fs from "@std/fs";

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

function command(tstrs: TemplateStringsArray, ...vars: Array<any>) {
  const strs: Array<string> = [...tstrs];
  const [command, ...args] = strs.shift()?.split?.(/\s+/) ?? [];

  for (let i = 0; i < strs.length; i++) {
    args.push(...strs[i].split(/\s+/));

    if (vars[i]) {
      args.push(vars[i]);
    }
  }

  return async (cwd = Deno.cwd()) => {
    const cmd = new Deno.Command(
      command,
      {
        args,
        cwd,
        stdin: "piped",
        stdout: "piped",
      },
    );

    await cmd.spawn().output();
  };
}
