import {createModel as createBaseModel} from '../model.js'
import {createContentView} from './content.js'

const contentView = createContentView({
  templates: {
    codeBlock(lines) {
      return {type: 'codeBlock', lines}
    },
    codeInline(text) {
      return {type: 'codeInline', text}
    },
    anchor(text, href) {
      return {type: 'anchor', text, href}
    },
    list(items) {
      return {type: 'list', items}
    },
    heading(text) {
      return {type: 'heading', text}
    },
    paragraph(items) {
      return items.length ? {type: 'paragraph', items} : null
    }
  }
})

export const createModel = (name) => {
  const model = {
    name,

    ...createBaseModel(name),

    convert(str) {
      return JSON.stringify(contentView(str), (_, value) => {
        if (Array.isArray(value)) {
          return value.filter((v) => v != null && v !== '\n')
        }

        return value
      })
    },

    async getList() {
      const res = await model.fetch(`/content/${name}.json`)

      return res.json()
    },

    async getBySlug(id) {
      const content = await (
        await model.fetch(`/content/raw/${id}.json`)
      ).json()

      const posts = await model.getList()

      const index = posts.findIndex((post) => post.slug === id)

      if (~index) {
        return {
          ...posts[index],
          content
        }
      }
    },

    async saveAll(data) {
      await model.fetch(`/content/${name}.json`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })

      if (name === 'posts' && data[0]) {
        const first = await model.getBySlug(data[0].slug)

        const firstUrl = '/content/_first.json'

        await model.fetch(firstUrl, {
          method: 'DELETE'
        })

        await model.fetch(firstUrl, {
          method: 'POST',
          body: model.convert(first.content)
        })
      }
    },

    async saveAs(name, data) {
      const subModel = createModel(name)

      await model.remove(data.slug)

      await subModel.save(data, false)
    },

    async save(data, existing = data.slug != null) {
      const posts = await model.getList()

      const index = existing
        ? posts.findIndex((post) => post.slug === data.slug)
        : -1

      if (!data.date || !existing) {
        const now = new Date()

        data.date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
          2,
          '0'
        )}-${String(now.getDate()).padStart(2, '0')}`
      }

      data.slug =
        data.slug ??
        data.title
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '-')

      data.content = data.content.replace(/\r/g, '')

      const {title, date, slug} = data

      if (!~index) {
        posts.unshift({title, date, slug})
      } else {
        posts.splice(index, 1, {title, date, slug})
      }

      await model.fetch(`/content/raw/${data.slug}.json`, {
        method: existing ? 'PUT' : 'POST',
        body: JSON.stringify(data.content)
      })

      await model.fetch(`/content/${data.slug}.json`, {
        method: existing ? 'PUT' : 'POST',
        body: model.convert(data.content)
      })

      await model.saveAll(posts)
    },

    async remove(id) {
      const posts = await model.getList()

      const index = posts.findIndex((p) => p.slug === id)

      if (~index) {
        posts.splice(index, 1)

        await model.fetch(`/content/raw/${id}.json`, {
          method: 'DELETE'
        })

        await model.fetch(`/content/${id}.json`, {
          method: 'DELETE'
        })

        await model.saveAll(posts)
      }
    }
  }

  return model
}
