import {html} from '@erickmerchant/framework'

export const createPreferencesFormView = ({classes, app}) => {
  const changePreference = (e) => {
    const preferences = {}

    if (e.target?.form) {
      const data = new FormData(e.target?.form)

      for (const [key, value] of data) {
        preferences[key] = value
      }
    }

    app.state = {...app.state, preferences}

    localStorage.setItem('preferences', JSON.stringify(app.state.preferences))
  }

  const escClose = (e) => {
    if (e.key === 'Escape') {
      app.state = {
        ...app.state,
        preferencesModalOpen: false
      }
    }
  }

  const checkboxView = ({name, value, checked, text}) => html`
    <label class=${classes.checkboxWrap}>
      <input
        class=${classes.checkbox}
        type="radio"
        :name=${name}
        :value=${value}
        :checked=${checked}
        @change=${changePreference}
        @keyup=${escClose}
      />
      ${text}
    </label>
  `

  const closeModal = () => {
    app.state = {
      ...app.state,
      preferencesModalOpen: false
    }
  }

  return (state) => html`
    <div
      class=${classes.backdrop}
      role="dialog"
      aria-modal="true"
      @click=${closeModal}
    >
      <div class=${classes.modal}>
        <form class=${classes.form}>
          <h2 class=${classes.heading}>Preferences</h2>
          <section class=${classes.fieldset}>
            <h3 class=${classes.label}>Color scheme:</h3>
            <div class=${classes.field}>
              ${checkboxView({
                name: 'colorScheme',
                value: 'auto',
                checked: (state.preferences.colorScheme ?? 'auto') === 'auto',
                text: 'Auto'
              })}
              ${checkboxView({
                name: 'colorScheme',
                value: 'dark',
                checked: state.preferences.colorScheme === 'dark',
                text: 'Dark'
              })}
              ${checkboxView({
                name: 'colorScheme',
                value: 'light',
                checked: state.preferences.colorScheme === 'light',
                text: 'Light'
              })}
            </div>
          </section>
          <section class=${classes.fieldset}>
            <h3 class=${classes.label}>Wrap code:</h3>
            <div class=${classes.field}>
              ${checkboxView({
                name: 'codeWrap',
                value: 'yes',
                checked: (state.preferences.codeWrap ?? 'yes') === 'yes',
                text: 'Yes'
              })}
              ${checkboxView({
                name: 'codeWrap',
                value: 'no',
                checked: state.preferences.codeWrap === 'no',
                text: 'No'
              })}
            </div>
          </section>
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
  `
}
