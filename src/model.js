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

    async getBySlug(id = '_first') {
      const [posts, content] = await Promise.all(
        [undefined, id].map((n = name) =>
          model.fetch(`/content/${n}.json`).then((res) => res.json())
        )
      )

      const index =
        id === '_first' ? 0 : posts.findIndex((post) => post.slug === id)

      if (~index) {
        return {
          ...posts[index],
          content,
          next: posts[index - 1],
          prev: posts[index + 1]
        }
      }
    }
  }

  return model
}
