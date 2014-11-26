mimosa-esperanto-es6-modules
===========
## Overview

This module will allow you to utilize ES6 module syntax when building your client code.  It will transpile your JavaScript with ES6 syntax to AMD or CommonJS compliant JavaScript and include source maps.

This module wraps [Rich Harris'](https://github.com/Rich-Harris) [esperanto](https://github.com/Rich-Harris/esperanto) library which performs the transpiling.

For more information regarding Mimosa, see http://mimosa.io

## Usage

Add `'esperanto-es6-modules'` to your list of modules.  That's all!  Mimosa will install the module for you when you start up.

## Functionality

This module will take your ES6 module syntax code and compile it down to a syntax usable with common module specs: AMD and CommonJS.

Compiled output will include inline source maps unless running `mimosa build`.

## Default Config

```javascript
esperanto: {
  type:"amd",
  exclude: [/[/\\]vendor[/\\]/, /[/\\]main[\.-]/, /-main.js$/, /[/\\]common.js$/],
  options: {
    strict: false
  }
}
```

- `type`: "amd", "commonjs", how you want your code to be transpiled.
- `exclude`:  List of regexes or strings to match files that should be excluded from transpiling.  String paths can be absolute or relative to the `watch.sourceDir`. Regexes are applied to the entire path.
- `options`: These options are passed directly to esperanto. The defaults above are applied. Check out [esperanto's docs](https://github.com/Rich-Harris/esperanto/wiki) to read up on the options.

## Using CoffeeScript?

For syntax like `import` to survive being transpiled by CoffeeScript you must use the compilers built-in ability to pass some code through the transpiler.  CoffeeScript, for instance, uses the backtick to essentially have the CoffeeScript compiler ignore the code contained within.
