import {html} from '@erickmerchant/framework'

export const createPreferencesView = ({classes, app, anchorAttrs}) => {
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

  return (state) => {
    Promise.resolve().then(() => {
      document.body.style.setProperty(
        '--code-white-space',
        state.preferences?.codeWrap === 'yes' ? 'pre-wrap' : 'pre'
      )

      const colorScheme = state.preferences?.colorScheme ?? 'auto'

      document.body.classList.add(colorScheme)

      for (const token of ['light', 'dark', 'auto']) {
        if (token === colorScheme) continue

        document.body.classList.remove(token)
      }
    })

    return html`
      <site-preferences>
        <button
          type="button"
          class=${classes.footerAnchor}
          @click=${() => {
            app.state = {...app.state, preferencesModalOpen: true}
          }}
        >
          Preferences
        </button>
        ${state.preferencesModalOpen
          ? html`
              <div class=${classes.backdrop}>
                <div class=${classes.modal}>
                  <form class=${classes.form}>
                    <h2 class=${classes.heading}>Preferences</h2>
                    <section class=${classes.fieldset}>
                      <h3 class=${classes.label}>Color scheme:</h3>
                      <div class=${classes.field}>
                        <label>
                          <input
                            @change=${changePreference}
                            type="radio"
                            name="colorScheme"
                            value="auto"
                            :checked=${(state.preferences.colorScheme ??
                              'auto') === 'auto'}
                          />
                          Auto
                        </label>
                        <label>
                          <input
                            @change=${changePreference}
                            type="radio"
                            name="colorScheme"
                            value="dark"
                            :checked=${state.preferences.colorScheme === 'dark'}
                          />
                          Dark
                        </label>
                        <label>
                          <input
                            @change=${changePreference}
                            type="radio"
                            name="colorScheme"
                            value="light"
                            :checked=${state.preferences.colorScheme ===
                            'light'}
                          />
                          Light
                        </label>
                      </div>
                    </section>
                    <section class=${classes.fieldset}>
                      <h3 class=${classes.label}>Wrap code:</h3>
                      <div class=${classes.field}>
                        <label>
                          <input
                            @change=${changePreference}
                            type="radio"
                            name="codeWrap"
                            value="yes"
                            :checked=${(state.preferences.codeWrap ?? 'yes') ===
                            'yes'}
                          />
                          Yes
                        </label>
                        <label>
                          <input
                            @change=${changePreference}
                            type="radio"
                            name="codeWrap"
                            value="no"
                            :checked=${state.preferences.codeWrap === 'no'}
                          />
                          No
                        </label>
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
