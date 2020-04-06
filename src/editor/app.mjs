import {render, domUpdate, html} from '@erickmerchant/framework'
import {classes} from './css/styles.mjs'

const state = {posts: []}

const target = document.querySelector('body')

const update = domUpdate(target)

const init = async (commit) => {
  try {
    const res = await fetch('/content/posts/index.json')

    const posts = await res.json()

    commit((state) => {
      state.posts = posts.reverse()

      return state
    })
  } catch (error) {
    commit((state) => {
      state.posts = []

      state.error = error

      return state
    })
  }
}

const create = (commit) => (e) => {
  e.preventDefault()

  commit((state) => {
    state.current = {
      title: '',
      content: ''
    }

    return state
  })
}

const edit = (commit, post) => async (e) => {
  e.preventDefault()

  try {
    const res = await fetch(`/content/posts/${post.slug}.json`)

    const {title, content} = await res.json()

    commit((state) => {
      state.current = {
        title,
        content
      }
    })
  } catch (error) {
    commit((state) => {
      state.current = {
        title: '',
        content: ''
      }

      state.error = error

      return state
    })
  }
}

const remove = (commit, post) => async (e) => {
  e.preventDefault()

  try {
    await fetch(`/content/posts/${post.slug}.json`, {method: 'DELETE'})

    init(commit)
  } catch (error) {
    commit((state) => {
      state.error = error

      return state
    })
  }
}

const component = ({state, commit}) => html`<body class=${classes.app}>
  <header class=${classes.header}>
    <h1 class=${classes.headerCell}>Posts</h1>
    <div class=${classes.headerControls}>
      <button class=${classes.control} onclick=${create(commit)}>New</button>
    </div>
  </header>
  <table class=${classes.table}>
    <thead>
      <tr>
        <th class=${classes.th}>Title</th>
        <th class=${classes.th}>Date</th>
        <th class=${classes.th} />
      </tr>
    </thead>
    <tbody>
      ${state.posts.map((post) => html`<tr>
        <td class=${classes.td}>${post.title}</td>
        <td class=${classes.td}>${new Date(post.date).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}</td>
        <td class=${classes.td}>
          <button class=${classes.control} onclick=${edit(commit, post)}>Edit</button>
          <button class=${classes.control} onclick=${remove(commit, post)}>Delete</button>
        </td>
      </tr>`)}
    </tbody>
  </table>
  ${state.current
    ? html`<div class=${classes.modal}>
    </div>`
    : null}
</body>`

const commit = render({state, update, component})

init(commit)
