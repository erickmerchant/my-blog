import {createPostsModel, slugify} from '../common.js'

export const createModel = (listEndpoint) => {
  return Object.assign(createPostsModel(listEndpoint), {
    async saveAll(data) {
      await this._fetch(listEndpoint, {
        method: 'PUT',
        body: JSON.stringify(data)
      })

      if (listEndpoint === '/content/posts.json' && data[0]) {
        const first = await this.getBySlug(data[0].slug)

        await this._fetch(`/content/__first.json`, {
          method: 'DELETE'
        })

        await this._fetch(`/content/__first.json`, {
          method: 'POST',
          body: JSON.stringify(first.content)
        })
      }
    },

    async saveAs(channelName, data) {
      const subModel = createModel(`/content/${channelName}.json`)

      await this.remove(data.slug)

      await subModel.save(data, false)
    },

    async save(data, existing = data.slug != null) {
      const posts = await this.getAll()

      const index = existing
        ? posts.findIndex((post) => post.slug === data.slug)
        : -1

      if (!data.date) {
        const now = new Date()

        data.date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
          2,
          '0'
        )}-${String(now.getDate()).padStart(2, '0')}`
      }

      data.slug = data.slug ?? slugify(data.title)

      data.content = data.content.replace(/\r/g, '')

      const {title, date, slug} = data

      if (!~index) {
        posts.unshift({title, date, slug})
      } else {
        posts.splice(index, 1, {title, date, slug})
      }

      await this._fetch(`/content/${data.slug}.json`, {
        method: existing ? 'PUT' : 'POST',
        body: JSON.stringify(data.content)
      })

      await this.saveAll(posts)
    },

    async remove(id) {
      const posts = await this.getAll()

      const index = posts.findIndex((p) => p.slug === id)

      if (~index) {
        posts.splice(index, 1)

        await this.saveAll(posts)

        await this._fetch(`/content/${id}.json`, {
          method: 'DELETE'
        })
      }
    }
  })
}
