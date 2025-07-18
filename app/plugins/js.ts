export default async function (
	{ path }: PluginParams,
) {
	const cmd = new Deno.Command(Deno.execPath(), {
		args: ["bundle", "--platform=browser", "--minify", path],
		cwd: Deno.cwd(),
		stdin: "piped",
		stdout: "piped",
	});

	const code = await cmd.spawn().output();

	return code.stdout;
}
