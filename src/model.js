export const createModel = (name = 'posts') => {
  const model = {
    async fetch(url, options = {}) {
      const res = await window.fetch(url, {
        ...options,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      if (!res.ok) {
        throw Error(`${res.status} ${res.statusText}`)
      }

      return res
    },

    async getByName(n = name) {
      const res = await model.fetch(`/content/${n}.json`)

      return res.json()
    },

    async getBySlug(id = '__first') {
      const [posts, content] = await Promise.all([
        model.getByName(),
        model.getByName(id)
      ])

      const index =
        id === '__first' ? 0 : posts.findIndex((post) => post.slug === id)

      if (~index) {
        return {
          ...posts[index],
          content: content,
          next: posts[index - 1],
          prev: posts[index + 1]
        }
      }
    }
  }

  return model
}
