export function command(tstrs: TemplateStringsArray, ...vars: Array<string>) {
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
