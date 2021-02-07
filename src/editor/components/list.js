import {html} from '@erickmerchant/framework/main.js'
import {listClasses} from '../css/styles.js'
import {dateUtils} from '../../common.js'

export const createListComponent = ({model, route, app}) => {
  const remove = (item) => async (e) => {
    e.preventDefault()

    e.target.blur()

    try {
      if (item.slug != null) {
        await model.remove(item.slug)

        const items = await model.getAll()

        app.state = {
          route,
          items
        }
      }
    } catch (error) {
      app.state.error = error
    }
  }

  return (state) => [
    html`
      <div class=${listClasses.tableContainer}>
        <nav>
          <ul class=${listClasses.nav}>
            <li class=${listClasses.navItem}>
              <a
                class=${state.route === 'posts'
                  ? listClasses.navAnchorCurrent
                  : listClasses.navAnchor}
                href="#/posts"
              >
                Posts
              </a>
            </li>
            <li class=${listClasses.navItem}>
              <a
                class=${state.route === 'drafts'
                  ? listClasses.navAnchorCurrent
                  : listClasses.navAnchor}
                href="#/drafts"
              >
                Drafts
              </a>
            </li>
          </ul>
        </nav>

        <table class=${listClasses.table}>
          <thead>
            <tr>
              <th class=${listClasses.th}>Title</th>
              <th class=${listClasses.th}>Date</th>
              <th class=${listClasses.th} />
            </tr>
          </thead>
          <tbody>
            ${state.items?.map(
              (item) => html`
                <tr>
                  <td class=${listClasses.td}>${item.title}</td>
                  <td class=${listClasses.td}>
                    ${dateUtils.prettyDate(dateUtils.stringToDate(item.date))}
                  </td>
                  <td class=${listClasses.tableControls}>
                    <a
                      tabindex="0"
                      class=${listClasses.editButton}
                      href=${`#/${route}/edit/${item.slug}`}
                    >
                      Edit
                    </a>
                    <button
                      tabindex="0"
                      class=${listClasses.deleteButton}
                      type="button"
                      onclick=${remove(item)}
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
        <a
          tabindex="0"
          class=${listClasses.createButton}
          href=${`#/${route}/create`}
        >
          New
        </a>
      </div>
    `
  ]
}
