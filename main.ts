import fs from "node:fs/promises";

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  await fs.rmdir("./dist", { recursive: true }).catch(() => true);

  await fs.cp("./public", "./dist");
}
