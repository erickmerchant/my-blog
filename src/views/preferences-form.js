import {html} from '@hyper-views/framework';

export const createPreferencesFormView = ({classes, app}) => {
  const changePreference = (e) => {
    const preferences = {};

    if (e.target?.form) {
      const data = new FormData(e.target?.form);

      for (const [key, value] of data) {
        preferences[key] = value;
      }
    }

    app.state = {...app.state, preferences};

    localStorage.setItem('preferences', JSON.stringify(app.state.preferences));
  };

  const escClose = (e) => {
    if (e.key === 'Escape') {
      app.state = {
        ...app.state,
        preferencesModalOpen: false,
      };
    }
  };

  const closeModal = () => {
    app.state = {
      ...app.state,
      preferencesModalOpen: false,
    };
  };

  return (state) => {
    const checkboxSet = ({title, name, items}) => html`
      <section class=${classes.fieldset}>
        <h3 class=${classes.label}>${title}:</h3>
        <div class=${classes.field}>
          ${items.map(
            ({value, text}, i) => html`
              <label class=${classes.checkboxWrap}>
                <input
                  class=${classes.checkbox}
                  type="radio"
                  :name=${name}
                  :value=${value}
                  :checked=${state.preferences[name] == null
                    ? i === 0
                    : state.preferences[name] === value}
                  @change=${changePreference}
                  @keyup=${escClose}
                />
                ${text}
              </label>
            `
          )}
        </div>
      </section>
    `;

    return html`
      <div
        class=${classes.backdrop}
        role="dialog"
        aria-modal="true"
        @click=${closeModal}
      >
        <div class=${classes.modal}>
          <form class=${classes.form}>
            <h2 class=${classes.heading}>Preferences</h2>
            ${checkboxSet({
              title: 'Color scheme',
              name: 'colorScheme',
              items: [
                {
                  value: 'auto',
                  text: 'Auto',
                },
                {
                  value: 'dark',
                  text: 'Dark',
                },
                {
                  value: 'light',
                  text: 'Light',
                },
              ],
            })}
            ${checkboxSet({
              title: 'Wrap code',
              name: 'codeWrap',
              items: [
                {
                  value: 'yes',
                  text: 'Yes',
                },
                {
                  value: 'no',
                  text: 'No',
                },
              ],
            })}
            <button
              class=${classes.doneLinkAnchor}
              type="button"
              @click=${closeModal}
            >
              Close
            </button>
          </form>
        </div>
      </div>
    `;
  };
};
