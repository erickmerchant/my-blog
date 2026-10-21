import { html } from "@handcraft/lib/h";
import attr from "@handcraft/lib/attr";

export default function () {
  return [
    html.link(
      attr.rel("icon"),
      attr.href("/favicon-light.png"),
      attr.type("image/svg+xml"),
      attr.media("(prefers-color-scheme: light)"),
    ),
    html.link(
      attr.rel("icon"),
      attr.href("/favicon-dark.png"),
      attr.type("image/svg+xml"),
      attr.media("(prefers-color-scheme: dark)"),
    ),
  ];
}
