import {html} from '@erickmerchant/framework'

export const createPreferencesView = ({classes, app}) => {
  const loadPreferences = () => {
    let preferences

    try {
      preferences = localStorage.getItem('preferences')

      preferences = preferences ? JSON.parse(preferences) : {}
    } catch {
      preferences = {}
    }

    app.state.preferences = preferences
  }

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

  return (state) => {
    Promise.resolve().then(() => {
      if (state.preferences == null) {
        loadPreferences()
      }

      const colorScheme = state.preferences?.colorScheme ?? 'auto'

      for (const token of ['light', 'dark', 'auto']) {
        document.body.classList.toggle(token, token === colorScheme)
      }

      document.body.style.setProperty(
        '--code-white-space',
        (state.preferences?.codeWrap ?? 'yes') === 'yes' ? 'pre-wrap' : 'pre'
      )

      document.body.style.setProperty(
        '--app-overflow',
        state.preferencesModalOpen ? 'hidden' : 'visible'
      )
    })

    return html`
      <site-preferences>
        <button
          type="button"
          class=${classes.footerAnchor}
          @click=${() => {
            app.state = {...app.state, preferencesModalOpen: true}

            Promise.resolve().then(() => {
              document.querySelector('site-preferences input').focus()
            })
          }}
        >
          Preferences
        </button>
        ${state.preferencesModalOpen
          ? html`
              <div class=${classes.backdrop} role="dialog" aria-modal="true">
                <div class=${classes.modal}>
                  <form class=${classes.form}>
                    <h2 class=${classes.heading}>Preferences</h2>
                    <section class=${classes.fieldset}>
                      <h3 class=${classes.label}>Color scheme:</h3>
                      <div class=${classes.field}>
                        ${checkboxView({
                          name: 'colorScheme',
                          value: 'auto',
                          checked:
                            (state.preferences.colorScheme ?? 'auto') ===
                            'auto',
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
                          checked:
                            (state.preferences.codeWrap ?? 'yes') === 'yes',
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
                    <div class=${classes.doneLink}>
                      <button
                        class=${classes.doneLinkAnchor}
                        type="button"
                        @click=${() => {
                          app.state = {
                            ...app.state,
                            preferencesModalOpen: false
                          }
                        }}
                      >
                        Done
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            `
          : null}
      </site-preferences>
    `
  }
}
