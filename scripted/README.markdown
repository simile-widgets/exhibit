Exhibit 3.0 Scripted
====================

This is the client-side source for [Exhibit 3.0][1].  See [Exhibit 2][2] for
where things are headed.

Getting Started
---------------

We are not at a point where users could do something with this code.

Developers
----------

Code is maintained in our [Github repostory][3].  Participating is welcome,
please start by following the [fork-pull method][6] of git development to start
contributing patches.

We run a [continuous integrator][4] on the code.  You can run the same
battery of tests locally if you have Java and [Ant][5] installed using
the command line:

```
% ant test
```

Make sure your changes don't cause any failures before making a pull
request.  If you're contributing a large portion of code, please consider
contributing testing and documentation to accompany your changes.  We use
[QUnit][7] for tests and [JsDoc Toolkit][8] for in-code documentation.

Participating
-------------

Developers can participate through the following avenues as well:

 * **Mailing list:** https://groups.google.com/group/simile-widgets/
 * **Issue tracker:** https://github.com/zepheira/exhibit3/issues
 * **IRC:** irc://irc.freenode.net:6667/#exhibit3

[1]: http://simile-widgets.org/exhibit3/
[2]: http://simile-widgets.org/exhibit/
[3]: https://github.com/zepheira/exhibit3/
[4]: https://ci.zepheira.com/job/test_exhibit3/
[5]: http://ant.apache.org/
[6]: http://help.github.com/pull-requests/
[7]: http://docs.jquery.com/Qunit
[8]: https://code.google.com/p/jsdoc-toolkit/wiki/TagReference
