+++
title = "Write your own HMR code"
slug = "write-your-own-hmr-code"
date = 2020-07-26
+++

Ever wanted to write your own Hot Module Replacement code, but have no idea where you'd start? This post is for you. Hot Module Replacement or HMR is one of those things that seems so magical, but I discovered a kind of clever way to do it. There are really two parts to it: a client-side part that's sort of like a IOC container, and a server-side part that uses something called Server-sent events or SSE.

# Client-side part

The problem with hot module replacement for the client-side is what to do when a module changes. The server signals that a module has changed and it is reloaded, but that's not really even most of the problem. How do you update your application without throwing it all away? The answer that I came up with is to use an object to store dependencies and a single function that is called initially and then whenever a dependency changes. Here is an example.

```javascript
import {createApp} from './framework.js';

const app = createApp();

// this is used to listen for changes
const eventSource = new EventSource('/changes');

// what modules have what properties
const map = {
  'view.js': 'view',
  'model.js': 'model',
};

// run when something changes and initially
const update = (container) => {
  app.setView(container.view);

  app.setModel(container.model);

  app.render();
};

// the container
const container = {};

// when something happens
eventSource.onmessage = async (e) => {
  const file = JSON.parse(e.data);

  if (map[file] != null) {
    container[map[file]] = await import(file);

    update(container);
  }
};

// initial work
for (const [file, property] of Object.entries(map)) {
  container[property] = await import(file);
}

update(container);
```

To use that code you'd basically change the entries of map and anything that's application specific. The framework import and all the uses of `app` in the example. The key to this code is EventSource which you use to open a persistent connection to a server, allowing the server to send messages.

# Server-side part

Now somewhere in your server code you'd have a route that responds to requests for "/changes".

```javascript
import chokidar from 'chokidar';
import path from 'path';

const srcDir = path.join(process.cwd(), './src/');

// listen for a get request to /changes
server.get('/changes', (req, res) => {
  // write head as 200 with these headers
  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    // don't set if this is using http2
    'Connection': 'keep-alive',
  };

  res.writeHead(200, headers);

  // use chokidar to listen for file changes
  chokidar.watch(srcDir, {ignoreInitial: true}).on('all', (type, file) => {
    file = path.relative(srcDir, file);

    // the new lines are significant here
    res.write(`data: ${JSON.stringify(file)}\n\n`);
  });

  // and here
  res.write(`\n\n`);
});
```

This concept is being used in [@erickmerchant/dev-cli](https://github.com/erickmerchant/dev-cli), which I use to build sites/apps.

# Some links

- [Server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [Dependency Injection](http://fabien.potencier.org/what-is-dependency-injection.html)
