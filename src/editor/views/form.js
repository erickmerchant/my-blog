import {html} from '@erickmerchant/framework'

import {
  formClasses,
  highlightClasses
} from '../../assets/editor/styles/index.js'
import {createContentView} from '../content.js'

export const createFormView = ({model, app}) => {
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
        app.state = {
          ...app.state,
          slugConflict: true
        }
      } else {
        app.state = {
          ...app.state,
          error,
          route: {key: 'error'}
        }
      }
    }
  }

  const saveAs = (name, item) => async (e) => {
    e.preventDefault()

    const data = serialize(item, e.target.closest('form'))

    try {
      await model.saveAs(name, data)

      window.location.hash = `#/${name}`
    } catch (error) {
      app.state = {
        ...app.state,
        error,
        route: {key: 'error'}
      }
    }
  }

  const contentView = createContentView({
    views: {
      codeBlock: (items, closed) => html`
        <span>
          <span class=${highlightClasses.punctuation}>${'```\n'}</span>
          <span class=${highlightClasses.codeBlock}>
            ${items.map((code) =>
              code === '\n'
                ? code
                : html`
                    <span>${code}</span>
                  `
            )}
          </span>
          ${closed
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
          <a tabindex="-1" class=${highlightClasses.url} :href=${href}>
            ${href}
          </a>
          <span class=${highlightClasses.punctuation}>)</span>
        </span>
      `,
      list: (items) =>
        html`
          <span>
            ${items.map((text) =>
              text === '\n'
                ? text
                : html`
                    <span>
                      <span class=${highlightClasses.punctuation}>${'- '}</span>
                      ${text}
                    </span>
                  `
            )}
          </span>
        `,
      paragraph: (text) =>
        html`
          <span>${text}</span>
        `
    }
  })

  const highlighter = (str = '') => contentView(str.replace(/\r/g, ''))

  const highlight = (e) => {
    app.state = {
      ...app.state,
      item: {
        ...app.state.item,
        highlightedContent: e.target.value,
        content: e.target.value
      }
    }
  }

  return (state) => html`
    <form
      autocomplete="off"
      class=${formClasses.form}
      @submit=${save(state.item)}
    >
      <div class=${formClasses.field}>
        <label class=${formClasses.label} for="field-title">Title</label>
        <input
          class=${formClasses.input}
          name="title"
          id="field-title"
          :value=${state.item.title ?? ''}
          @input=${(e) => {
            app.state = {
              ...app.state,
              item: {...app.state.item, title: e.target.value}
            }
          }}
        />
      </div>
      <div class=${formClasses.field}>
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
            @input=${highlight}
          >
              ${state.item.content ?? ''}
            </textarea
          >
        </div>
      </div>
      <div class=${formClasses.buttons}>
        ${state.slugConflict
          ? html`
              <p class=${formClasses.errorMessage}>This item already exists</p>
            `
          : null}
        <a class=${formClasses.cancelButton} :href=${`#/${model.name}`}>
          Cancel
        </a>
        ${model.name !== 'posts' && state.item.slug != null
          ? html`
              <button
                class=${formClasses.publishButton}
                type="button"
                @click=${saveAs('posts', state.item)}
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
