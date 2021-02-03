import {html} from '@erickmerchant/framework/main.js'
import {formClasses, highlightClasses} from '../css/styles.js'
import {contentComponent} from '../../common.js'

export const createFormComponent = ({postModel, app, slugify}) => {
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

  const save = (post) => async (e) => {
    e.preventDefault()

    const id = post.slug

    const data = {}

    for (const [key, val] of Object.entries(post)) {
      data[key] = val
    }

    for (const [key, val] of new FormData(e.target)) {
      data[key] = val
    }

    try {
      await postModel.save(id, data)

      window.location.hash = '#'
    } catch (error) {
      app.state.error = error
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
    app.state.post = {
      ...app.state.post,
      highlightedContent: e.target.value,
      content: e.target.value
    }
  }

  return (state) => html`
    <form
      onsubmit=${save(state.post)}
      method="POST"
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
            value=${state.post.title ?? ''}
            oninput=${(e) => {
              app.state.post = {
                ...app.state.post,
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
            value=${state.post.date ?? ''}
            oninput=${(e) => {
              app.state.post = {
                ...app.state.post,
                date: e.target.value
              }
            }}
            ${zIndexHandlers}
          />
        </div>
        <div>
          <label class=${formClasses.label} for="field-slug">Slug</label>
          <input
            class=${state.post.slug != null
              ? formClasses.inputReadOnly
              : formClasses.input}
            name="slug"
            id="field-slug"
            readonly=${state.post.slug != null}
            value=${state.post.slug ?? ''}
            placeholder=${slugify(state.post.title ?? '')}
            oninput=${state.post.slug == null
              ? (e) => {
                  app.state.post = {
                    ...app.state.post,
                    slug: e.target.value
                  }
                }
              : null}
            ${zIndexHandlers}
          />
        </div>
        <div class=${formClasses.formRow}>
          <label class=${formClasses.label} for="field-content">Content</label>
          <div class=${formClasses.textareaWrap}>
            <div class=${formClasses.textareaHighlightsWrap}>
              <pre class=${formClasses.textareaHighlights}>
            ${highlighter(state.post.highlightedContent)}
          </pre>
            </div>
            <textarea
              class=${formClasses.textarea}
              name="content"
              id="field-content"
              oninput=${highlight}
              ${zIndexHandlers}
            >
            ${state.post.content ?? ''}
          </textarea
            >
          </div>
        </div>
      </div>
      <div class=${formClasses.formButtons}>
        <a class=${formClasses.cancelButton} href="#/" ${zIndexHandlers}>
          Cancel
        </a>
        <button class=${formClasses.saveButton} type="submit" ${zIndexHandlers}>
          Save
        </button>
      </div>
    </form>
  `
}
