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

    getAll() {
      return model.fetch(`/content/${name}.json`).then((res) => res.json())
    },

    async getBySlug(id = '__first') {
      const [posts, content] = await Promise.all([
        model.getAll(),
        model.fetch(`/content/${id}.json`).then((response) => response.json())
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
