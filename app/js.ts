import SWC from "@swc/core";
import { saveCacheBusted } from "./cache-busting.ts";

export async function runSWC(
  path: string,
  content: string,
  imports: Array<string>,
): Promise<string> {
  const parsedJsContent = await SWC.parse(content);

  imports.push(
    ...parsedJsContent.body.filter(({ type }) => type === "ImportDeclaration")
      .map((
        item,
        // @ts-ignore won't fix
      ) => item.source.value),
  );

  const { code } = await SWC
    .transform(parsedJsContent, {
      filename: path,
      sourceMaps: false,
      minify: true,
      jsc: {
        target: "es2024",
        parser: {
          syntax: "ecmascript",
        },
      },
    });

  return code;
}

export async function optimizeJS(path: string, imports: Array<string>) {
  const jsContent = await Deno.readTextFile(path);
  const code = await runSWC(path, jsContent, imports);

  await saveCacheBusted(path, code);
}
