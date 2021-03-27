import {html} from '@erickmerchant/framework'

import {createContentView} from '../../common.js'
import {formClasses, highlightClasses} from '../css/styles.js'

export const createFormView = ({model, app, slugify}) => {
  const serialize = (item, target) => {
    const data = {}

    for (const [key, val] of Object.entries(item)) {
      data[key] = val
    }

    for (const [key, val] of new FormData(target)) {
      data[key] = val
    }

    return data
  }

  const save = (item) => async (e) => {
    e.preventDefault()

    const data = serialize(item, e.target.closest('form'))

    try {
      await model.save(data)

      window.location.hash = `#/${model.name}`
    } catch (error) {
      if (error.message.startsWith('409')) {
        app.state.slugConflict = true
      } else {
        app.state.error = error

        app.state.route = {key: 'error', params: []}
      }
    }
  }

  const saveAs = (name, item) => async (e) => {
    e.preventDefault()

    const data = serialize(item, e.target.closest('form'))

    try {
      await model.saveAs(name, data)

      window.location.hash = `#/posts`
    } catch (error) {
      app.state.error = error

      app.state.route = {key: 'error', params: []}
    }
  }

  const contentView = createContentView({
    templates: {
      bold: (text) => html`
        <span>
          <span class=${highlightClasses.punctuation}>*</span>
          <span class=${highlightClasses.bold}>${text}</span>
          <span class=${highlightClasses.punctuation}>*</span>
        </span>
      `,
      codeBlock: (items, isClosed) => html`
        <span>
          <span class=${highlightClasses.punctuation}>${'```\n'}</span>
          <span class=${highlightClasses.codeBlock}>${items}</span>
          ${isClosed
            ? html`
                <span class=${highlightClasses.punctuation}>${'```'}</span>
              `
            : null}
        </span>
      `,
      codeBlockLine: (code) => html`
        <span>${code}</span>
      `,
      codeBlockComment: (comment) => html`
        <span>${comment}</span>
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
    publicFacing: false
  })

  const highlighter = (str = '') => contentView(str.replace(/\r/g, ''))

  const highlight = (e) => {
    app.state.item = Object.assign({}, app.state.item, {
      highlightedContent: e.target.value,
      content: e.target.value
    })
  }

  return (state) => html`
    <form
      onsubmit=${save(state.item)}
      autocomplete="off"
      class=${formClasses.form}
    >
      <fieldset class=${formClasses.fields}>
        <div>
          <label class=${formClasses.label} for="field-title">Title</label>
          <input
            class=${formClasses.input}
            name="title"
            id="field-title"
            value=${state.item.title ?? ''}
            oninput=${(e) => {
              app.state.item = Object.assign({}, app.state.item, {
                title: e.target.value
              })
            }}
          />
        </div>
        <div>
          <label class=${formClasses.label} for="field-content">Content</label>
          <div class=${formClasses.textareaWrap}>
            <div class=${formClasses.textareaHighlightsWrap}>
              <pre class=${formClasses.textareaHighlights}>
                ${highlighter(state.item.highlightedContent)}
              </pre
              >
            </div>
            <textarea
              class=${formClasses.textarea}
              name="content"
              id="field-content"
              oninput=${highlight}
            >
              ${state.item.content ?? ''}
            </textarea
            >
          </div>
        </div>
      </fieldset>
      <div class=${formClasses.buttons}>
        ${state.slugConflict
          ? html`
              <p class=${formClasses.errorMessage}>This item already exists</p>
            `
          : null}
        <a class=${formClasses.cancelButton} href=${`#/${model.name}`}>
          Cancel
        </a>
        ${model.name === 'drafts' && state.item.slug != null
          ? html`
              <button
                class=${formClasses.saveButton}
                type="button"
                onclick=${saveAs('posts', state.item)}
              >
                Publish
              </button>
            `
          : null}
        <button class=${formClasses.saveButton} type="submit">Save</button>
      </div>
    </form>
  `
}
