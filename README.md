# looks.js

### Code reformatting tool for JavaScript

*Before:*

```js
var y,x =1;

y=function (){
  return (13+1 ) / 2
}
```


*After:*

```js
var x = 1,
    y;

y = function() {
  return (13 + 1) / 2;
};
```

