# looks

## Code reformatting tool for JavaScript

**WARN: Not ready for dev or production use!**

*Before:*

```js
var y,x =1;

y=function (){
  return (13+1 ) / 2
}
```


*Run:*

```
./bin/looks airbnb index.js
```


*After:*

```js
var x = 1,
    y;

y = function() {
  return (13 + 1) / 2;
};
```


### Main Idea

**look** allows programmers to implement *codestyles*.

*Codestyle* is a combination of *transformer* and *printer*.

*Transformer* does recast *ast* transformations.

*Printer* prints *ast*.

### Implemented transformers

- [ComposedTransformer](./lib/transformers/ComposedTransformer.js)

    Allows to do ordered composition of *transformers*.

- [GatherDeclarations](./lib/transformers/GatherDeclarations.js)

    Gather all `var`s in function/module and place on top of
    function/module.


    *Before*:

    ```js
    function f() {
      x = y;
      var a;
      var b = 1;
    }
    ```

    *After*:

    ```js
    function f() {
      var a, b = 1;
      x = y;
    }
    ```

- [SortDeclarationsByInit](./lib/transformers/SortDeclarationsByInit.js)


    Place declarators with init before declarations without init.

    *Before*

    ```js
    function f() {
      var x, y = 1;
    }
    ```

    *After*

    ```js
    function f() {
      var y = 1, x;
    }
    ```

- [SortBodyByPriority](./lib/transformers/SortBodyByPriority.js)

    Sort function/module body by priority:

    - `'use strict';`
    - Function Declarations
    - Variable Declarations
    - everything else


    *Before*

    ```js
    function f() {
      a = b + 1;
      var i;
      function z() {}
    }
    ```

    *After*

    ```js
    function f() {
      function z() {}
      var i;
      a = b + 1;
    }
    ```
