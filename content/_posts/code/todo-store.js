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
          for (let todo of state.todos) {
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
