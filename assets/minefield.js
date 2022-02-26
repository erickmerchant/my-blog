window.customElements.define(
  "minefield-game",
  class extends HTMLElement {
    connectedCallback() {
      this.addEventListener("minefield:reveal", (e) => {
        const { row, column } = e.detail;

        const selectors = [
          `[row="${row - 1}"][column="${column - 1}"]`,
          `[row="${row - 1}"][column="${column}"]`,
          `[row="${row - 1}"][column="${column + 1}"]`,
          `[row="${row}"][column="${column - 1}"]`,
          `[row="${row}"][column="${column + 1}"]`,
          `[row="${row + 1}"][column="${column - 1}"]`,
          `[row="${row + 1}"][column="${column}"]`,
          `[row="${row + 1}"][column="${column + 1}"]`,
        ];

        for (const selector of selectors) {
          this.shadowRoot
            ?.querySelector(`minefield-tile${selector}[neighbors][hidden]`)
            ?.reveal();
        }
      });
    }
  }
);

window.customElements.define(
  "minefield-tile",
  class extends HTMLElement {
    flagged = false;
    clicked = false;

    toggleFlagged = (e) => {
      e.preventDefault();

      this.flagged = !this.flagged;

      this.render();
    };

    toggleClicked = (e) => {
      e.preventDefault();

      this.reveal();
    };

    connectedCallback() {
      const button = this.shadowRoot?.querySelector("button");

      button?.addEventListener("click", this.toggleClicked);
      button?.addEventListener("contextmenu", this.toggleFlagged);

      this.row = Number(this.shadowRoot?.host?.getAttribute("row"));
      this.column = Number(this.shadowRoot?.host?.getAttribute("column"));

      const neighbors = this.shadowRoot?.host?.getAttribute("neighbors");

      this.neighbors = neighbors != null ? Number(neighbors) : null;
    }

    reveal() {
      this.clicked = !this.clicked;

      if (this.neighbors === 0) {
        Promise.resolve().then(() => {
          const event = new CustomEvent("minefield:reveal", {
            bubbles: true,
            composed: true,
            detail: {
              row: this.row,
              column: this.column,
            },
          });

          this.dispatchEvent(event);
        });
      }

      this.render();
    }

    render() {
      let button = this.shadowRoot?.querySelector("button");

      if (button) {
        button.innerHTML = this.flagged ? "🚩" : "";
      }

      this.shadowRoot
        ?.querySelector("slot-match")
        ?.setAttribute("name", this.clicked ? "shown" : "hidden");

      this.shadowRoot?.host?.toggleAttribute("hidden", !this.clicked);
    }
  }
);
