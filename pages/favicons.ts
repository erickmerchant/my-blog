import { h } from "@handcraft/lib";

const { link } = h.html;

export default function () {
  return [
    link
      .rel("icon")
      .href("/favicon-light.png")
      .type("image/svg+xml")
      .media("(prefers-color-scheme: light)"),
    link
      .rel("icon")
      .href("/favicon-dark.png")
      .type("image/svg+xml")
      .media("(prefers-color-scheme: dark)"),
  ];
}
