import {render, domUpdate, html} from '@erickmerchant/framework'
import {classes} from './css/styles.mjs'

const state = {posts: []}

const target = document.querySelector('body')

const update = domUpdate(target)

const init = async (commit) => {
  const res = await fetch('/content/posts/index.json')

  const posts = await res.json()

  commit((state) => {
    state.posts = posts

    return state
  })
}

const component = ({state, commit}) => html`<body class=${classes.app}>
  <div class=${classes.half}>
    <table class=${classes.table}>
      <caption class=${classes.caption}>Posts <button>New</button></caption>
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
            <button>Edit</button>
            <button>Delete</button>
          </td>
        </tr>`)}
      </tbody>
    </table>
  </div>
  <div class=${classes.half}>

  </div>
</body>`

const commit = render({state, update, component})

init(commit)
