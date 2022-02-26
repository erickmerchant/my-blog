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

      this.clicked = !this.clicked;

      if (this.empty) {
        const event = new CustomEvent("minefield:emptyrevealed", {
          bubbles: true,
          composed: true,
        });

        this.shadowRoot?.host?.dispatchEvent(event);
      }

      this.render();
    };

    connectedCallback() {
      this.shadowRoot?.host?.addEventListener(
        "minefield:emptyrevealed",
        () => {
          console.log(this.row, this.column);
        },
        true
      );

      const button = this.shadowRoot?.querySelector("button");

      button?.addEventListener("click", this.toggleClicked);
      button?.addEventListener("contextmenu", this.toggleFlagged);

      this.row = Number(this.shadowRoot?.host?.getAttribute("row"));
      this.column = Number(this.shadowRoot?.host?.getAttribute("column"));
      this.empty = this.shadowRoot?.host?.hasAttribute("empty");
    }

    render() {
      let button = this.shadowRoot?.querySelector("button");

      if (button) {
        button.innerHTML = this.flagged ? "🚩" : "";
      }

      this.shadowRoot
        ?.querySelector("slot-match")
        ?.setAttribute("name", this.clicked ? "shown" : "hidden");
    }
  }
);
