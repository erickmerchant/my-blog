const storageKey = 'todo-data'

module.exports = function (commit) {
  /* Pull out any stored state from localStorage */
  let stored = window.localStorage.getItem(storageKey)
  let todos = []
  let completed = 0
  let next = 0

  if (stored) {
    stored = JSON.parse(stored)

    todos = stored.todos
    completed = stored.todos.filter((todo) => todo.completed).length
    next = stored.next
  }

  /* commit is called with the initial state */
  commit(function () {
    return {
      todos,
      completed,
      next,
      value: '',
      current: null,
      hash: '#/all'
    }
  })

  /* a function is returned that gets called anytime dispatch is called. It will get called with commit as the first argument followed by all the things dispatch was called with */
  return function (action, args) {
    /* commit is how the state is changed. What it returns becomes the new state */
    commit(function (state) {
      let index

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
          index = state.todos.indexOf(args.todo)

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
          index = state.todos.indexOf(args.todo)

          if (index > -1) {
            state.todos[index].completed = args.completed

            state.completed += (args.completed ? 1 : -1)
          }
          break

        case 'remove-todo':
          index = state.todos.indexOf(args.todo)

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

      /* Store todos and next in localStorage */
      window.localStorage.setItem(storageKey, JSON.stringify({
        todos: state.todos,
        next: state.next
      }))

      return state
    })
  }
}
