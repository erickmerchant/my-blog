import {html} from '@erickmerchant/framework';

import {listClasses} from '../../assets/editor/styles/index.js';
import {prettyDate} from '../../content.js';

export const createListView = ({model, app}) => {
  const remove = (item) => async (e) => {
    e.preventDefault();

    e.target.blur();

    try {
      if (item.slug != null) {
        await model.remove(item.slug);

        const items = await model.getList();

        app.state = {
          route: {key: 'list', params: []},
          items,
        };
      }
    } catch (error) {
      app.state = {...app.state, error};
    }
  };

  return (state) => html`
    <div class=${listClasses.container}>
      <div
        :class=${state.items?.length
          ? listClasses.tableWrapper
          : listClasses.tableWrapperEmpty}
      >
        ${state.items?.length
          ? html`
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
                          ${prettyDate(item.date)}
                        </td>
                        <td class=${listClasses.controls}>
                          <a
                            tabindex="0"
                            class=${listClasses.editButton}
                            :href=${`#/edit/${item.slug}`}
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
            `
          : html`
              <p class=${listClasses.noTable}>No posts yet</p>
            `}
      </div>

      <div class=${listClasses.buttons}>
        <a tabindex="0" class=${listClasses.createButton} href="#/create">
          New
        </a>
      </div>
    </div>
  `;
};
