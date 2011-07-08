Exhibit 3.0 Staged
==================

This is the server-side source for [Exhibit 3.0][1].  It is currently
based on [Node.js][2] and the [Express][3] framework.

Getting Started
---------------

There isn't enough here to run something you could use.  But if you wanted
to see that little run, here's what to do.  First, install Node.js.  Then
follow these steps to acquire dependencies, assuming you're starting in
the same directory as this README:

```
% cd src
% npm install -d
```

From the scripted side, acquire the Node-oriented exhibit.js:

```
% cd ../../scripted
% ant node
% mv build/node/exhibit.js ../staged/src/node_modules/exhibit/
```

Finally, run it:

```
% cd ../staged/src/
% node app.js
```

[1]: http://simile-widgets.org/exhibit3/
[2]: http://nodejs.org/
[3]: http://expressjs.com/
