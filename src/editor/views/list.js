import {html} from '@erickmerchant/framework'

import {listClasses} from '../../asset/editor/styles/index.js'
import {prettyDate} from '../../content.js'

export const createListView = ({model, app, channelNames, hasNew}) => {
  const remove = (item) => async (e) => {
    e.preventDefault()

    e.target.blur()

    try {
      if (item.slug != null) {
        await model.remove(item.slug)

        const items = await model.getList()

        app.state = {
          route: {key: 'list', params: [model.name]},
          items
        }
      }
    } catch (error) {
      app.state = {...app.state, error}
    }
  }

  return (state) => html`
    <div class=${listClasses.container}>
      <nav>
        <ul class=${listClasses.nav}>
          ${channelNames.map(
            (name) => html`
              <li>
                <a
                  class=${listClasses.navAnchor}
                  :aria-current=${state.route.params?.[0] === name
                    ? 'true'
                    : 'false'}
                  :href=${`#/${name}`}
                >
                  ${name.toUpperCase()}
                </a>
              </li>
            `
          )}
        </ul>
      </nav>
      <div class=${listClasses.tableWrapper}>
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
                  <td class=${listClasses.td}>${prettyDate(item.date)}</td>
                  <td class=${listClasses.controls}>
                    <a
                      tabindex="0"
                      class=${listClasses.editButton}
                      :href=${`#/${model.name}/edit/${item.slug}`}
                    >
                      Edit
                    </a>
                    <button
                      tabindex="0"
                      class=${listClasses.deleteButton}
                      type="button"
                      @click=${remove(item)}
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
      <div class=${listClasses.buttons}>
        ${hasNew
          ? html`
              <a
                tabindex="0"
                class=${listClasses.createButton}
                :href=${`#/${model.name}/create`}
              >
                New
              </a>
            `
          : ''}
      </div>
    </div>
  `
}
