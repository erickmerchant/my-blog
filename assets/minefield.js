window.customElements.define(
  "minefield-dialog",
  class MinefieldDialog extends HTMLElement {
    hasTimeout;

    onConfirm = () => {
      window.location.reload();
    };

    onClose = () => {
      this.toggleAttribute("open", false);

      this.shadowRoot?.getElementById("dialog")?.close();
    };

    onOpen = () => {
      this.toggleAttribute("open", true);

      this.shadowRoot?.getElementById("dialog")?.show();

      this.shadowRoot?.querySelector("button")?.focus();

      if (this.hasTimeout) {
        setTimeout(this.onClose, 3000);
      }
    };

    connectedCallback() {
      this.hasTimeout = this.hasAttribute("has-timeout");

      this.addEventListener("slot:enter", this.onOpen);

      this.shadowRoot
        ?.getElementById("submit")
        ?.addEventListener("click", this.onConfirm);

      this.shadowRoot
        ?.getElementById("cancel")
        ?.addEventListener("click", this.onClose);
    }
  }
);

window.customElements.define(
  "minefield-flags",
  class MinefieldFlags extends HTMLElement {
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
  class MinefieldTime extends HTMLElement {
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
  class MinefieldTile extends HTMLElement {
    flagged = false;
    state = 0; // 0: hidden, 1: shown, 2: disarmed
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
          number: this.flagged ? 1 : -1,
        },
      });

      this.dispatchEvent(event);

      this.flagged = !this.flagged;

      this.render();
    };

    toggleClicked = (e) => {
      e.preventDefault();

      // the reveal() call happens in minefield-game
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

      if (!this.flagged && this.state === 0) {
        this.state = 1;

        this.render();

        revealed = true;
      }

      return revealed;
    }

    disarm() {
      let revealed = false;

      if (!this.flagged && this.state === 0) {
        this.state = 2;

        this.render();

        revealed = true;
      }

      return revealed;
    }

    connectedCallback() {
      let button = this.shadowRoot?.getElementById("reveal-button");

      button?.addEventListener("click", this.toggleClicked);
      button?.addEventListener("contextmenu", this.toggleFlagged);

      this.row = Number(this.getAttribute("row"));
      this.column = Number(this.getAttribute("column"));
      this.empty = this.hasAttribute("empty");
      this.mine = this.hasAttribute("mine");
    }

    render() {
      this.shadowRoot
        ?.getElementById("reveal-button")
        ?.replaceChildren(this.flagged ? "🚩" : "");

      this.shadowRoot
        ?.getElementById("switch")
        ?.setName(["hidden", "shown", "disarmed"][this.state]);

      this.toggleAttribute("hidden", this.state === 0);
    }
  }
);

window.customElements.define(
  "minefield-game",
  class MinefieldGame extends HTMLElement {
    gameOver = false;
    gameStarted = false;
    remaining;
    dialogName;

    onReveal = (e) => {
      let { row, column, mine, empty } = e.detail;

      this.dialogName = null;

      if (mine && !this.gameStarted) {
        if (
          this.shadowRoot
            ?.querySelector(
              `minefield-tile[row="${row}"][column="${column}"][hidden]`
            )
            ?.disarm()
        ) {
          this.remaining--;

          this.dialogName = "mulligan";
        }
      } else {
        let pairs = [[row, column]];

        do {
          let [row, column] = pairs.shift();
          let tile = this.shadowRoot?.querySelector(
            `minefield-tile[row="${row}"][column="${column}"][hidden]:not([mine])`
          );
          let revealed = tile?.reveal() ?? false;

          if (revealed) {
            this.remaining--;

            if (tile.empty) {
              pairs.push(
                [row - 1, column - 1],
                [row - 1, column],
                [row - 1, column + 1],
                [row, column - 1],
                [row, column + 1],
                [row + 1, column - 1],
                [row + 1, column],
                [row + 1, column + 1]
              );
            }
          }
        } while (empty && pairs.length);
      }

      if (!this.gameOver) {
        let timeElement = this.shadowRoot?.getElementById("time");

        if (mine && this.gameStarted) {
          this.gameOver = true;

          for (let tile of this.shadowRoot?.querySelectorAll(
            `minefield-tile[hidden]`
          )) {
            tile.reveal();
          }

          timeElement?.stopIfStarted();

          this.dialogName = "loss";
        } else if (this.remaining > 0) {
          timeElement?.startIfStopped();
        } else {
          this.gameOver = true;

          timeElement?.stopIfStarted();

          this.dialogName = "win";
        }
      }

      this.gameStarted = true;

      this.render();
    };

    onFlag = (e) => {
      this.shadowRoot?.getElementById("flags")?.step(e.detail?.number);
    };

    connectedCallback() {
      this.remaining = Number(this.getAttribute("remaining"));

      this.addEventListener("minefield:reveal", this.onReveal);
      this.addEventListener("minefield:flag", this.onFlag);
    }

    render() {
      let confirm = this.shadowRoot?.getElementById("dialog-switch");

      if (this.dialogName) {
        confirm?.setName(this.dialogName);
      }
    }
  }
);
