(function o(t) {
  t.querySelectorAll("template[shadowroot]").forEach((t) => {
    const e = t.getAttribute("shadowroot"),
      a = t.parentNode.attachShadow({ mode: e });
    a.appendChild(t.content), t.remove(), o(a);
  });
})(document);
