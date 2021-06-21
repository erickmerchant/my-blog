export const createContentView =
  ({templates}) =>
  (json) => {
    const result = []

    const inline = (items) => {
      const result = []

      for (const item of items) {
        if (Array.isArray(item)) {
          result.push(inline(item))
        } else if (item.type) {
          result.push(templates[item.type](item))
        } else {
          result.push(item)
        }
      }

      return result
    }

    for (const section of json) {
      let items = []

      if (section.items) {
        items = inline(section.items)
      }

      result.push(templates[section.type]({...section, items}))
    }

    return result
  }

export const dateUtils = {
  stringToDate(str) {
    const [year, month, day] = str.split('-').map((v) => Number(v))

    const date = new Date(year, month - 1, day)

    return date
  },

  prettyDate(date) {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
}
