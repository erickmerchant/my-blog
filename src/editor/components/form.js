import {html} from '@erickmerchant/framework/main.js'
import {formClasses, highlightClasses} from '../css/styles.js'
import {contentComponent} from '../../common.js'

export const createFormComponent = ({model, route, app, slugify}) => {
  const zIndexHandlers = {
    onkeydown(e) {
      if (e.key === 'Meta') {
        app.state.zIndex = -1
      }
    },
    onkeyup(e) {
      app.state.zIndex = 0
    }
  }

  const save = (item) => async (e) => {
    e.preventDefault()

    const data = {}

    for (const [key, val] of Object.entries(item)) {
      data[key] = val
    }

    for (const [key, val] of new FormData(e.target)) {
      data[key] = val
    }

    try {
      await model.save(data)

      window.location.hash = `#/${route}`
    } catch (error) {
      if (error.message.startsWith('409')) {
        app.state.slugConflict = true
      } else {
        app.state.error = error

        app.state.route = 'error'
      }
    }
  }

  const highlighter = (str = '') =>
    contentComponent(
      str.replace(/\r/g, ''),
      {},
      {
        strong: (text) => html`
          <span>
            <span class=${highlightClasses.punctuation}>*</span>
            <span class=${highlightClasses.bold}>${text}</span>
            <span class=${highlightClasses.punctuation}>*</span>
          </span>
        `,
        codeBlock: (code, isClosed) => html`
          <span>
            <span class=${highlightClasses.punctuation}>${'```\n'}</span>
            <span class=${highlightClasses.codeBlock}>${code}</span>
            ${isClosed
              ? html`
                  <span class=${highlightClasses.punctuation}>${'```'}</span>
                `
              : null}
          </span>
        `,
        codeInline: (text) => html`
          <span>
            <span class=${highlightClasses.punctuation}>${'`'}</span>
            <span class=${highlightClasses.codeInline}>${text}</span>
            <span class=${highlightClasses.punctuation}>${'`'}</span>
          </span>
        `,
        heading: (text) => html`
          <span>
            <span class=${highlightClasses.headingPunctuation}>${'# '}</span>
            <span class=${highlightClasses.heading}>${text}</span>
          </span>
        `,
        anchor: (text, href) => html`
          <span>
            <span class=${highlightClasses.punctuation}>[</span>
            ${text}
            <span class=${highlightClasses.punctuation}>]</span>
            <span class=${highlightClasses.punctuation}>(</span>
            <a tabindex="-1" class=${highlightClasses.url} href=${href}>
              ${href}
            </a>
            <span class=${highlightClasses.punctuation}>)</span>
          </span>
        `,
        list: (items) =>
          html`
            <span>${items}</span>
          `,
        listItem: (text) => html`
          <span>
            <span class=${highlightClasses.punctuation}>${'- '}</span>
            ${text}
          </span>
        `,
        paragraph: (text) =>
          html`
            <span>${text}</span>
          `
      },
      false
    )

  const highlight = (e) => {
    app.state.item = {
      ...app.state.item,
      highlightedContent: e.target.value,
      content: e.target.value
    }
  }

  return (state) => html`
    <form
      onsubmit=${save(state.item)}
      autocomplete="off"
      ${zIndexHandlers}
      class=${formClasses.form}
    >
      <div class=${formClasses.formFields}>
        <div class=${formClasses.formRow}>
          <label class=${formClasses.labelLarge} for="field-title">Title</label>
          <input
            class=${formClasses.inputLarge}
            name="title"
            id="field-title"
            value=${state.item.title ?? ''}
            oninput=${(e) => {
              app.state.item = {
                ...app.state.item,
                title: e.target.value
              }
            }}
            ${zIndexHandlers}
          />
        </div>
        <div>
          <label class=${formClasses.label} for="field-date">Date</label>
          <input
            class=${formClasses.input}
            name="date"
            type="date"
            id="field-date"
            value=${state.item.date ?? ''}
            oninput=${(e) => {
              app.state.item = {
                ...app.state.item,
                date: e.target.value
              }
            }}
            ${zIndexHandlers}
          />
        </div>
        <div>
          <label class=${formClasses.label} for="field-slug">Slug</label>
          <input
            class=${formClasses.inputReadOnly}
            name=${state.item.slug ? 'slug' : null}
            id="field-slug"
            readonly
            value=${state.item.slug ?? ''}
            placeholder=${slugify(state.item.title ?? '')}
          />
        </div>
        <div class=${formClasses.formRow}>
          <label class=${formClasses.label} for="field-content">Content</label>
          <div class=${formClasses.textareaWrap}>
            <div class=${formClasses.textareaHighlightsWrap}>
              <pre class=${formClasses.textareaHighlights}>
            ${highlighter(state.item.highlightedContent)}
          </pre>
            </div>
            <textarea
              class=${formClasses.textarea}
              name="content"
              id="field-content"
              oninput=${highlight}
              ${zIndexHandlers}
            >
            ${state.item.content ?? ''}
          </textarea
            >
          </div>
        </div>
      </div>
      <div class=${formClasses.formButtons}>
        ${state.slugConflict
          ? html`
              <p class=${formClasses.errorMessage}>This item already exists</p>
            `
          : null}
        <a
          class=${formClasses.cancelButton}
          href=${`#/${route}`}
          ${zIndexHandlers}
        >
          Cancel
        </a>
        ${route === 'drafts' && state.item.slug != null
          ? html`
              <button
                class=${formClasses.saveButton}
                type="submit"
                name="route"
                value="posts"
                ${zIndexHandlers}
              >
                Publish
              </button>
            `
          : null}
        <button
          class=${formClasses.saveButton}
          name="route"
          value=${route}
          type="submit"
          ${zIndexHandlers}
        >
          Save
        </button>
      </div>
    </form>
  `
}
