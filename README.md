QAConn
--------

QAConn is a JQuery plugin that show information of a server connection.

Copyright 2013 Eduardo García, all rights reserved.

This source file is free software, under either the GPL v3 license, 
as supplied with this software.

This source file is distributed in the hope that it will be useful, but 
WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY 
or FITNESS FOR A PARTICULAR PURPOSE.

Usage
-------

Declare javascript libraries, you must declare the qaconn javascript library
and a qaconn language library, it's show bellow:

```javascript
<script type="text/javascript" src="../lib/jquery.qaconn.js"></script>
<script type="text/javascript" src="../lib/jquery.qaconn.es.js"></script>
```

The next step is declare the html plugin container:

```HTML
<div id="qaconn"></div>
```

Finally start the plugin in your javascript code block:

```javascript
$("#qaconn").qaconn({remote: {url: "noProcess.html", process: false}});
```

Demo page
-------

You can view a demo in: [QAConn Demo](http://jkingii.com/QAConn/)
