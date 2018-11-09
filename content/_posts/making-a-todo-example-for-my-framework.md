<p>This year I started working on a framework that I published as <a href="https://www.npmjs.com/package/@erickmerchant/framework">@erickmerchant/framework</a> to npm. It's not meant to be a serious contender in the world of frameworks, but I intend to use it and keep improving it. It's inspired by React and others, but much simpler. I first saw the term "data down, actions up" with yo-yo and I'd describe it as such. It doesn't come with a built-in way of outputting html, but I've been using it with <a href="https://www.npmjs.com/package/nanohtml">nanohtml</a> and <a href="https://www.npmjs.com/package/nanomorph">nanomorph</a>. This month I've been working a lot on making a Todo example, as in TodoMVC. Below are the three JavaScript files for that with a lot of comments.

<h2>index.js</h2>

``` javascript
const framework = require('@erickmerchant/framework')
const store = require('./store')
const component = require('./component')
const diff = require('nanomorph')
const target = document.querySelector('main')

/* framework is called with a settings object. Four things are required. store provides our state. component provides our dom element. diff provides a means to apply changes to that element. target is the element on the page that will get replaced with what the component returns. framework returns a function that's called with a callback that sets up a hash router.
*/
framework({ target, store, component, diff })((dispatch) => {
  window.onhashchange = () => {
    dispatch('set-hash', { hash: window.location.hash })
  }

  dispatch('set-hash', { hash: window.location.hash })
})
```

<h2>store.js</h2>

``` javascript
const storageKey = 'todo-data'

module.exports = (commit) => {
  /* Pull out any stored state from localStorage */
  let stored = window.localStorage.getItem(storageKey)
  let todos = []
  let completed = 0

  if (stored) {
    stored = JSON.parse(stored)

    todos = stored.todos
    completed = stored.todos.filter((todo) => todo.completed).length
  }

  /* commit is called with the initial state */
  commit(() => {
    return {
      todos,
      completed,
      value: '',
      current: null,
      hash: '#/all'
    }
  })

  /* this function is dispatch */
  return (action, args = {}) => {
    /* commit is how the state is changed. What it returns becomes the new state */
    commit((state) => {
      let index

      if (args.todo) {
        index = state.todos.indexOf(args.todo)
      }

      switch (action) {
        case 'set-value':
          state.value = args.title
          break

        case 'set-current':
          state.current = args.todo
          break

        case 'set-hash':
          state.hash = typeof args.hash === 'string' && args.hash !== '' ? args.hash : '#/all'
          break

        case 'unset-current':
          state.current = null
          break

        case 'add-todo':
          state.todos.push({
            title: args.title,
            completed: false
          })
          break

        case 'edit-todo':
          if (index > -1) {
            state.todos[index].title = args.title
          }
          break

        case 'set-all-todos-completedness':
          for (const todo of state.todos) {
            todo.completed = args.completed
          }

          if (args.completed) {
            state.completed = state.todos.length
          } else {
            state.completed = 0
          }
          break

        case 'set-todo-completedness':
          if (index > -1) {
            state.todos[index].completed = args.completed

            state.completed += (args.completed ? 1 : -1)
          }
          break

        case 'remove-todo':
          if (index > -1) {
            if (state.todos[index].completed) {
              state.completed -= 1
            }

            state.todos.splice(index, 1)
          }
          break

        case 'remove-completed-todos':
          state.todos = state.todos.filter((todo) => !todo.completed)

          state.completed = 0
          break
      }

      /* Store state in localStorage */
      return storage(state)
    })
  }

  function storage (state) {
    window.localStorage.setItem(storageKey, JSON.stringify({
      todos: state.todos
    }))

    return state
  }
}
```

<h2>component.js</h2>

``` javascript
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
```

<p>View the live version <a href="https://todo.erickmerchant.com">here</a>.
