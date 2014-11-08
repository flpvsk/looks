var transformersPath = '../../lib/transformers',
    recast = require('recast'),
    assert = require('assert'),
    GatherDeclarations = require(transformersPath + '/GatherDeclarations');

describe('GatherDeclarations transformer', function() {


  it('works in simple case (no inner functions)', function() {
    var gather = new GatherDeclarations(),
        expected,
        result,
        code,
        ast;

    code = [
      'function name() {',
      '  var z = 1; var y; x + y; var x = 2;',
      '}'
    ].join('\n');

    expected = [
      'function name() {',
      '  var z = 1, y, x = 2;',
      '  x + y;',
      '}'
    ].join('\n');

    ast = recast.parse(code);

    gather.visit(ast);
    result = recast.prettyPrint(ast, {tabWidth: 2}).code;

    assert.equal(expected, result);
  });


  it('works with for-loops', function() {
    var gather = new GatherDeclarations(),
        expected,
        result,
        code,
        ast;

    code = [
      'function name(a) {',
      '  for (var i = 0, l = a.length; i < l; i++) {',
      '    i + 1;',
      '  }',
      '}'
    ].join('\n');

    expected = [
      'function name(a) {',
      '  var i, l;',
      '',
      '  for (i = 0, l = a.length; i < l; i++) {',
      '    i + 1;',
      '  }',
      '}'
    ].join('\n');

    ast = recast.parse(code);

    gather.visit(ast);
    result = recast.prettyPrint(ast, {tabWidth: 2}).code;

    assert.equal(result, expected);

  });
});

