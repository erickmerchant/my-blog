const makeErrorPost = (title, children) => {
  return {
    title,
    content: [
      {
        type: 'paragraph',
        children,
      },
    ],
  };
};

const getDispatchLocation =
  ({app, postsModel, forceRoute}) =>
  async ({pathname, hash = ''}) => {
    if (pathname === app.state?.pathname && !forceRoute) return;

    const matches = {
      posts: pathname.match(/^\/?(?:posts\/([a-z0-9-]+)|)\/?$/),
    };

    const state = {
      isLoading: false,
      pathname,
      post: makeErrorPost('Page Not Found', [
        {type: 'text', value: 'Try starting '},
        {type: 'link', children: [{type: 'text', value: 'here'}], url: '/'},
        {type: 'text', value: '.'},
      ]),
    };

    if (matches.posts) {
      try {
        const [id] = matches.posts.slice(1);

        const post = await postsModel.getBySlug(id);

        if (post != null) {
          state.post = post;

          state.route = 'post';
        }
      } catch (error) {
        if (!error.message.startsWith('404')) {
          state.post = makeErrorPost('Error Caught', [
            {type: 'text', value: error.message},
          ]);
        }
      }
    }

    const newPath = pathname !== app.state?.pathname;

    if (newPath || forceRoute) {
      app.state = {...app.state, ...state};
    }

    await Promise.resolve();

    if (hash) {
      document.querySelector(hash)?.scrollIntoView();
    } else if (newPath) {
      window.scroll(0, 0);
    }
  };

export const setupRouting = ({app, postsModel, forceRoute}) => {
  const dispatchLocation = getDispatchLocation({app, postsModel, forceRoute});

  window.onpopstate = () => {
    dispatchLocation(window.location);
  };

  dispatchLocation(window.location);

  return (href) => (e) => {
    e.preventDefault();

    window.history.pushState({}, '', href);

    dispatchLocation({pathname: href});
  };
};
