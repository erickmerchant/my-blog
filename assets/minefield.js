window.customElements.define(
  "minefield-game",
  class extends HTMLElement {
    gameOver = false;
    message;
    remaining;

    onReveal = (e) => {
      let { row, column, mine, empty } = e.detail;
      let { revealed, pairs } =
        this.shadowRoot
          ?.querySelector(
            `minefield-tile[row="${row}"][column="${column}"][hidden]`
          )
          ?.reveal() ?? {};

      if (revealed) {
        this.remaining--;
      }

      if (empty) {
        while (pairs.length) {
          let [row, column] = pairs.shift();

          let result =
            this.shadowRoot
              ?.querySelector(
                `minefield-tile[row="${row}"][column="${column}"][hidden]:not([mine])`
              )
              ?.reveal() ?? {};

          if (result.revealed) {
            this.remaining--;
          }

          if (result.pairs) {
            pairs.push(...result.pairs);
          }
        }
      }

      if (!this.gameOver) {
        let timeElement = this.shadowRoot?.querySelector(`minefield-time`);

        if (mine) {
          this.gameOver = true;

          for (let tile of this.shadowRoot?.querySelectorAll(
            `minefield-tile[hidden]`
          )) {
            tile.reveal();
          }

          timeElement?.stopIfStarted();

          this.message = "You lost. Try again?";
        } else {
          if (this.remaining > 0) {
            timeElement?.startIfStopped();
          } else {
            this.gameOver = true;

            timeElement?.stopIfStarted();

            this.message = "You won! Start new game?";
          }
        }
      }

      this.render();
    };

    onFlag = (e) => {
      this.shadowRoot?.querySelector(`minefield-flags`)?.step(e.detail?.number);
    };

    connectedCallback() {
      this.remaining = Number(this.getAttribute("remaining"));

      this.addEventListener("minefield:reveal", this.onReveal);
      this.addEventListener("minefield:flag", this.onFlag);
    }

    render() {
      let confirm = this.shadowRoot?.querySelector("minefield-confirm");

      if (this.message) {
        confirm?.replaceChildren(this.message);
      }

      if (this.gameOver) {
        confirm?.show();
      }
    }
  }
);

window.customElements.define(
  "minefield-confirm",
  class extends HTMLElement {
    show() {
      this.shadowRoot?.querySelector("slot-match")?.setName("open");

      let button = this.shadowRoot?.querySelector("button");

      button?.addEventListener(
        "click",
        () => {
          window.location.reload();
        },
        {
          once: true,
        }
      );

      button?.focus();
    }
  }
);

window.customElements.define(
  "minefield-flags",
  class extends HTMLElement {
    count;

    connectedCallback() {
      this.count = Number(this.getAttribute("count"));
    }

    step(number) {
      this.count += number;

      this.render();
    }

    render() {
      this.shadowRoot?.replaceChildren(this.count);
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

      window.setTimeout(() => {
        this.render();
      }, 250);

      let time = Math.floor((Date.now() - this.startTime) / 1000);

      this.shadowRoot?.replaceChildren(time);
    }
  }
);

window.customElements.define(
  "minefield-tile",
  class extends HTMLElement {
    flagged = false;
    shown = false;
    row;
    column;
    empty;
    mine;

    toggleFlagged = (e) => {
      e.preventDefault();

      let event = new CustomEvent("minefield:flag", {
        bubbles: true,
        composed: true,
        detail: {
          number: this.flagged ? -1 : 1,
        },
      });

      this.dispatchEvent(event);

      this.flagged = !this.flagged;

      this.render();
    };

    toggleClicked = (e) => {
      e.preventDefault();

      let event = new CustomEvent("minefield:reveal", {
        bubbles: true,
        composed: true,
        detail: {
          row: this.row,
          column: this.column,
          empty: this.empty,
          mine: this.mine,
        },
      });

      this.dispatchEvent(event);
    };

    reveal() {
      let revealed = false;
      let pairs = [];

      if (!this.flagged && !this.shown) {
        this.shown = true;

        this.render();

        revealed = true;

        if (this.empty) {
          pairs = [
            [this.row - 1, this.column - 1],
            [this.row - 1, this.column],
            [this.row - 1, this.column + 1],
            [this.row, this.column - 1],
            [this.row, this.column + 1],
            [this.row + 1, this.column - 1],
            [this.row + 1, this.column],
            [this.row + 1, this.column + 1],
          ];
        }
      }

      return { revealed, pairs };
    }

    connectedCallback() {
      let button = this.shadowRoot?.querySelector("button");

      button?.addEventListener("click", this.toggleClicked);
      button?.addEventListener("contextmenu", this.toggleFlagged);

      this.row = Number(this.getAttribute("row"));
      this.column = Number(this.getAttribute("column"));
      this.empty = this.hasAttribute("empty");
      this.mine = this.hasAttribute("mine");
    }

    render() {
      this.shadowRoot
        ?.querySelector("button")
        .replaceChildren(this.flagged ? "🚩" : "");

      this.shadowRoot
        ?.querySelector("slot-match")
        .setName(this.shown ? "shown" : "hidden");

      this.toggleAttribute("hidden", !this.shown);
    }
  }
);
