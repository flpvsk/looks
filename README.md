# looks

### Code reformatting tool for JavaScript

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

