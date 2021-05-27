import {createModel as createBaseModel} from '../model.js'

export const createModel = (name) => {
  const model = {
    name,

    ...createBaseModel(name),

    async saveAll(data) {
      await model.fetch(`/content/${name}.json`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })

      if (name === 'posts' && data[0]) {
        const first = await model.getBySlug(data[0].slug)

        const firstUrl = '/content/__first.json'

        await model.fetch(firstUrl, {
          method: 'DELETE'
        })

        await model.fetch(firstUrl, {
          method: 'POST',
          body: JSON.stringify(first.content)
        })
      }
    },

    async saveAs(name, data) {
      const subModel = createModel(name)

      await model.remove(data.slug)

      await subModel.save(data, false)
    },

    async save(data, existing = data.slug != null) {
      const posts = await model.getByName()

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

      await model.fetch(`/content/${data.slug}.json`, {
        method: existing ? 'PUT' : 'POST',
        body: JSON.stringify(data.content)
      })

      await model.saveAll(posts)
    },

    async remove(id) {
      const posts = await model.getByName()

      const index = posts.findIndex((p) => p.slug === id)

      if (~index) {
        posts.splice(index, 1)

        await model.saveAll(posts)

        await model.fetch(`/content/${id}.json`, {
          method: 'DELETE'
        })
      }
    }
  }

  return model
}
