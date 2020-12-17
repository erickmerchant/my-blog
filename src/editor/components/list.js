import {html} from '@erickmerchant/framework/main.js'
import {listClasses} from '../css/styles.js'
import {dateUtils} from '../../common.js'

export const createListComponent = ({postModel, app, init}) => {
  const remove = (post) => async (e) => {
    e.preventDefault()

    try {
      if (post.slug != null) {
        await postModel.remove(post.slug)

        const state = await init()

        app.commit(state)
      }
    } catch (error) {
      app.commit((state) => {
        state.error = error
      })
    }
  }

  return (state) => [
    html`
      <div class=${listClasses.tableContainer}>
        <header>
          <h1 class=${listClasses.headerHeading}>Posts</h1>
        </header>

        <table class=${listClasses.table}>
          <thead>
            <tr>
              <th class=${listClasses.th}>Title</th>
              <th class=${listClasses.th}>Date</th>
              <th class=${listClasses.th} />
            </tr>
          </thead>
          <tbody>
            ${state.posts.map(
              (post) => html`
                <tr>
                  <td class=${listClasses.td}>${post.title}</td>
                  <td class=${listClasses.td}>
                    ${dateUtils.prettyDate(dateUtils.stringToDate(post.date))}
                  </td>
                  <td class=${listClasses.tableControls}>
                    <a
                      tabindex="0"
                      class=${listClasses.editButton}
                      href=${`#/posts/edit/${post.slug}`}
                    >
                      Edit
                    </a>
                    <a
                      tabindex="0"
                      class=${listClasses.viewButton}
                      target="_blank"
                      href=${`/posts/${post.slug}`}
                    >
                      View
                    </a>
                    <button
                      tabindex="0"
                      class=${listClasses.deleteButton}
                      type="button"
                      onclick=${remove(post)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              `
            )}
          </tbody>
        </table>
      </div>
    `,
    html`
      <div class=${listClasses.tableButtons}>
        <a tabindex="0" class=${listClasses.createButton} href="#/posts/create">
          New
        </a>
      </div>
    `
  ]
}
