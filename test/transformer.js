'use strict';

var recast = require('recast'),
    debug = require('debug')('looks:transformer'),
    assert = require('assert'),
    GatherDeclarations = require('../lib/transformers/GatherDeclarations'),
    SortDeclarationsByName = require('../lib/transformers/SortDeclarationsByName'),
    SortDeclarationsByInit = require('../lib/transformers/SortDeclarationsByInit'),
    _ = require('lodash');


describe('VarTransformer', function() {

  it('can fix declarations', function() {
    var gather = new GatherDeclarations(),
        sortByName = new SortDeclarationsByName(),
        sortByInit = new SortDeclarationsByInit(),
        expected,
        code,
        ast;

    code = [
      'function name() {',
      '  var z = 1; var y; x + y; var x = 2;',
      '}'
    ].join('\n');

    expected = [
      'function name() {',
      '  var x = 2, z = 1, y;',
      '  x + y;',
      '}'
    ].join('\n');

    ast = recast.parse(code);

    gather.visit(ast);
    sortByName.visit(ast);
    sortByInit.visit(ast);

    assert.equal(expected, recast.prettyPrint(ast, {tabWidth: 2}).code);
  });

});
