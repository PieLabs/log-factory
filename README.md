# log-factory

A little log library that makes it simple to add a logger to your module.

```javascript

import {buildLogger} from 'log-factory';
let logger = buildLogger();

```

### Configuration

```javascript 

  import {init} from 'log-factory';

  /**
   * Calling init will only affect loggers after this call.
   * So it is advisable to call this at the start of your app 
   */

   init({
     console: false,
     file: 'my-log.log',
     log: 'INFO'
   });
```

The options for `init` are: 

* console - true/false, default: `true`
* file - direct logs to a file, default: `undefined`
* log - string|json-string|path-to-json-file, default: `'info'`
  * string - error|warn|info|debug|verbose|silly
  * json-string - a string that can be parsed as json 
  * path-to-json - a path to a json file 


> If you want to disable logging you can pass in: `{ console: false, file: undefined}`
If using json you can define levels for different categories. For example: 

```json 
{
  "app": "info",
  "item" : "debug"
}
```

`default` is a special category that will be applied if the category can't be found. 

To see the available categories, first run the log with level `silly`, the name in the square brackets is the category.

# test

`npm test`

# build 

`npm run main`


## TODO

add `release-helper` to the build (will need to be updated to work with gulp 4.0).