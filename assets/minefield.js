window.customElements.define(
  "minefield-game",
  class extends HTMLElement {
    gameOver = false;

    connectedCallback() {
      this.remaining = Number(this.getAttribute("remaining"));

      this.addEventListener("minefield:reveal", (e) => {
        const { row, column, neighbors } = e.detail;

        if (neighbors === 0) {
          const pairs = [
            [row - 1, column - 1],
            [row - 1, column],
            [row - 1, column + 1],
            [row, column - 1],
            [row, column + 1],
            [row + 1, column - 1],
            [row + 1, column],
            [row + 1, column + 1],
          ];

          for (const [row, column] of pairs) {
            this.shadowRoot
              ?.querySelector(
                `minefield-tile[row="${row}"][column="${column}"][neighbors][hidden]`
              )
              ?.reveal();
          }
        }

        if (!this.gameOver) {
          const timeElement = this.shadowRoot?.querySelector(`minefield-time`);

          if (neighbors == null) {
            this.gameOver = true;

            timeElement?.stopIfStarted();

            this.confirmReset("You lost. Try again?");
          } else {
            this.remaining--;

            if (this.remaining > 0) {
              timeElement?.startIfStopped();
            } else {
              this.gameOver = true;

              timeElement?.stopIfStarted();

              this.confirmReset("You won! Start new game?");
            }
          }
        }
      });

      this.addEventListener("minefield:flag", (e) => {
        this.shadowRoot?.querySelector(`minefield-flags`)?.decrement();
      });

      this.addEventListener("minefield:unflag", (e) => {
        this.shadowRoot?.querySelector(`minefield-flags`)?.increment();
      });
    }

    confirmReset(message) {
      setTimeout(() => {
        const reload = window.confirm(message);

        if (reload) {
          window.location.reload();
        }
      }, 0);
    }
  }
);

window.customElements.define(
  "minefield-flags",
  class extends HTMLElement {
    connectedCallback() {
      this.count = Number(this.getAttribute("count"));
    }

    increment() {
      this.count++;

      this.render();
    }

    decrement() {
      this.count--;

      this.render();
    }

    render() {
      if (this.shadowRoot) this.shadowRoot.innerHTML = this.count;
    }
  }
);

window.customElements.define(
  "minefield-time",
  class extends HTMLElement {
    startTime = null;

    startIfStopped() {
      if (this.startTime == null) {
        this.startTime = Date.now();

        this.render();
      }
    }

    stopIfStarted() {
      if (this.startTime != null) {
        this.startTime = null;
      }
    }

    render() {
      if (this.startTime == null) return;

      setTimeout(() => {
        this.render();
      }, 250);

      if (this.shadowRoot) {
        const time = Math.floor((Date.now() - this.startTime) / 1000);

        this.shadowRoot.innerHTML = time;
      }
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

      const eventType = this.flagged ? "minefield:unflag" : "minefield:flag";

      Promise.resolve().then(() => {
        const event = new CustomEvent(eventType, {
          bubbles: true,
          composed: true,
        });

        this.dispatchEvent(event);
      });

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

      this.row = Number(this.getAttribute("row"));
      this.column = Number(this.getAttribute("column"));

      const neighbors = this.getAttribute("neighbors");

      this.neighbors = neighbors != null ? Number(neighbors) : null;
    }

    reveal() {
      Promise.resolve().then(() => {
        const event = new CustomEvent("minefield:reveal", {
          bubbles: true,
          composed: true,
          detail: {
            row: this.row,
            column: this.column,
            neighbors: this.neighbors,
          },
        });

        this.dispatchEvent(event);
      });

      if (!this.flagged) {
        this.clicked = !this.clicked;

        this.render();
      }
    }

    render() {
      let button = this.shadowRoot?.querySelector("button");

      if (button) {
        button.innerHTML = this.flagged ? "🚩" : "";
      }

      this.shadowRoot
        ?.querySelector("slot-match")
        .setName(this.clicked ? "shown" : "hidden");

      this.toggleAttribute("hidden", !this.clicked);
    }
  }
);
