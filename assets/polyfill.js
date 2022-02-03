let polyfillDeclartiveShadowDOM = (target) => {
  for (let template of target.querySelectorAll("template[shadowroot]")) {
    let mode = template.getAttribute("shadowroot");
    let shadowRoot = template.parentNode.attachShadow({ mode });

    shadowRoot.appendChild(template.content);
    template.remove();

    polyfillDeclartiveShadowDOM(shadowRoot);
  }
};

polyfillDeclartiveShadowDOM(document);
