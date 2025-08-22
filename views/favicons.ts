import { h } from "@handcraft/lib";

const { link } = h.html;

export default function ({ resolve }: { resolve: (url: string) => string }) {
  return [
    link
      .rel("icon")
      .href(resolve("/favicon-light.png"))
      .type("image/svg+xml")
      .media("(prefers-color-scheme: light)"),
    link
      .rel("icon")
      .href(resolve("/favicon-dark.png"))
      .type("image/svg+xml")
      .media("(prefers-color-scheme: dark)"),
  ];
}
