const html = require('nanohtml')
const ENTER_KEY = 13
const ESCAPE_KEY = 27

/* The component gets called with the current state, dispatch which is a means to signal change, and next which is a way to interact with the page after a render */
module.exports = ({ state, dispatch, next }) => {
  /* After the diff is called if an item is being edited, focus it */
  next((target) => {
    const input = target.querySelector('input.edit')

    if (input) {
      const length = input.value.length * 2

      input.focus()

      input.setSelectionRange(length, length)
    }
  })

  return html`<main>
    <section class="todoapp">
      <header class="header">
        <h1>todos</h1>
        <input
          class="new-todo"
          autofocus
          autocomplete="off"
          placeholder="What needs to be done?"
          value="${state.value}"
          onkeyup=${add}
        />
      </header>
      ${list()}
      ${footer()}
    </section>
    <footer class="info">
      <p>Double-click to edit a todo</p>
      <p>Created by <a href="https://erickmerchant.com">Erick Merchant</a></p>
      <p>View the source <a href="https://github.com/erickmerchant/framework-todo">here</a></p>
    </footer>
  </main>`

  function list () {
    return state.todos.length > 0
      ? html`<section class="main">
          <input
            id="toggle-all"
            class="toggle-all"
            type="checkbox"
            onchange=${toggleAll}
            checked="${state.todos.length - state.completed === 0}"
            autofocus
          />
          <label for="toggle-all">Mark all as complete</label>
          <ul class="todo-list">
            ${state.todos.filter(filterByHash).map(item)}
          </ul>
        </section>`
      : ''
  }

  function footer () {
    return state.todos.length > 0
      ? html`<footer class="footer">
          <span class="todo-count">
            <strong>${state.todos.length - state.completed}</strong>
            ${state.todos.length - state.completed !== 1 ? ' items' : ' item'} left
          </span>
          <ul class="filters">
            <li><a href="#/all" class="${state.hash === '#/all' ? 'selected' : ''}">All</a></li>
            <li><a href="#/active" class="${state.hash === '#/active' ? 'selected' : ''}">Active</a></li>
            <li><a href="#/completed" class="${state.hash === '#/completed' ? 'selected' : ''}">Completed</a></li>
          </ul>
          ${clearCompletedButton()}
        </footer>`
      : ''
  }

  function clearCompletedButton () {
    return state.completed > 0
      ? html`<button
          class="clear-completed"
          onclick=${() => dispatch('remove-completed-todos')}>
            Clear completed
        </button>`
      : ''
  }

  function filterByHash (todo) {
    return state.hash === '#/all' || (state.hash === '#/active' && !todo.completed) || (state.hash === '#/completed' && todo.completed)
  }

  function item (todo) {
    return html`
    <li class="todo ${todo.completed ? 'completed' : ''} ${state.current === todo ? 'editing' : ''}">
      <div class="view">
        <input
          class="toggle"
          type="checkbox"
          onchange=${(e) => toggle(todo, e)}
          checked="${todo.completed}"
        />
        <label ondblclick=${() => dispatch('set-current', { todo })}>${todo.title}</label>
        <button class="destroy" onclick=${() => dispatch('remove-todo', { todo })}></button>
      </div>
      ${editInput()}
    </li>`

    function editInput () {
      return state.current === todo
        ? html`<input
            class="edit"
            type="text"
            value="${todo.title}"
            onblur=${() => dispatch('unset-current')}
            onkeyup=${(e) => edit(todo, e)}
          />`
        : ''
    }
  }

  /* If the enter key is pressed add a todo and clear the current value. Otherwise save what was entered to value, because when the state changes the input should not clear */
  function add (e) {
    const title = e.currentTarget.value
    if (e.keyCode === ENTER_KEY && e.currentTarget.value) {
      dispatch('add-todo', { title })

      dispatch('set-value', { title: '' })
    } else {
      dispatch('set-value', { title })
    }
  }

  /* If there are any incomplete todo items, set them as complete. If all are completed set all as incomplete. */
  function toggleAll (e) {
    const completed = !(state.todos.length - state.completed === 0)
    dispatch('set-all-todos-completedness', { completed })
  }

  /* Toggle this todo item's completedness */
  function toggle (todo, e) {
    e.preventDefault()

    const completed = e.currentTarget.checked

    dispatch('set-todo-completedness', { todo, completed })
  }

  function edit (todo, e) {
    switch (e.keyCode) {
      /* The user is done editing. Save changes and exit out of edited this todo item. */
      case ENTER_KEY:
        dispatch('unset-current')

        if (e.currentTarget.value) {
          const title = e.currentTarget.value

          dispatch('edit-todo', { todo, title })
        } else {
          dispatch('remove-todo', { todo })
        }
        break

      /* Just exit out of editing */
      case ESCAPE_KEY:
        dispatch('unset-current')
        break
    }
  }
}
