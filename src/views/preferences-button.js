/* eslint require-atomic-updates: 0 */

import {html} from '@erickmerchant/framework'

export const createPreferencesButtonView = ({
  classes,
  loadPreferencesForm,
  preferencesForm,
  app
}) => {
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

  return (state) => {
    Promise.resolve().then(async () => {
      if (state.preferences == null) {
        loadPreferences()
      }

      const colorScheme = state.preferences?.colorScheme ?? 'auto'

      for (const token of ['light', 'dark', 'auto']) {
        document.body.classList.toggle(token, token === colorScheme)
      }

      document.body.style.setProperty(
        '--code-wrap',
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
          @click=${async () => {
            if (preferencesForm == null) {
              preferencesForm = await loadPreferencesForm()
            }

            app.state = {...app.state, preferencesModalOpen: true}

            Promise.resolve().then(() => {
              document.querySelector('site-preferences input').focus()
            })
          }}
        >
          Preferences
        </button>
        ${state.preferencesModalOpen && preferencesForm
          ? preferencesForm(state)
          : null}
      </site-preferences>
    `
  }
}
