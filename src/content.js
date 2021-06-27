export const createContentView =
  ({templates}) =>
  (json) => {
    const result = []

    const inline = (items) => {
      const result = []

      for (const item of items) {
        if (item.type) {
          result.push(templates[item.type](item))
        } else {
          result.push(item)
        }
      }

      return result
    }

    for (const section of json) {
      result.push(templates[section.type]({...section}, inline))
    }

    return result
  }

export const stringToDate = (str) => {
  const [year, month, day] = str.split('-').map((v) => Number(v))

  const date = new Date(year, month - 1, day)

  return date
}

export const prettyDate = (date) => {
  return stringToDate(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
