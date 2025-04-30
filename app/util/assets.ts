import * as LightningCSS from "lightningcss";
import SWC from "@swc/core";

export function runLightning(
  path: string,
  content: Uint8Array,
): Promise<string> {
  const { code } = LightningCSS.transform({
    filename: path,
    code: content,
    minify: true,
    sourceMap: false,
  });

  return Promise.resolve(code.toString());
}

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
