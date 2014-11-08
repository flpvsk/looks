'use strict';

var recast = require('recast'),
    assert = require('assert'),
    SortBody = require('../../lib/transformers/SortBodyByPriority');

describe('SortBody transformer', function() {

  var _doTest = function _doTest(input, expectedResult) {
    var sortBody = new SortBody(),
        ast,
        result;


    ast = recast.parse(input);

    sortBody.visit(ast);
    result = recast.prettyPrint(ast, {tabWidth: 2}).code;

    assert.equal(result, expectedResult);
  };


  it('places use strict in the begining', function() {
    var code, expected;

    code = [
      'function name() {',
      '  a + b;',
      '  "use strict";',
      '}',
    ].join('\n');

    expected = [
      'function name() {',
      '  "use strict";',
      '  a + b;',
      '}',
    ].join('\n');

    _doTest(code, expected);
  });


  it('places function decl before variable decl', function() {
    var code, expected;

    code = [
      'function name() {',
      '  var a = 1;',
      '  function b() {}',
      '}',
    ].join('\n');

    expected = [
      'function name() {',
      '  function b() {}',
      '  var a = 1;',
      '}',
    ].join('\n');


    _doTest(code, expected);
  });


  it('places variable declarations before everything else', function() {
      var code, expected;

      code = [
        'function name() {',
        '  a + b;',
        '  x = 4;',
        '  var i;',
        '}'
      ].join('\n');


      expected = [
        'function name() {',
        '  var i;',
        '  a + b;',
        '  x = 4;',
        '}'
      ].join('\n');


      _doTest(code, expected);
  });
});
