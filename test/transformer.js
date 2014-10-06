'use strict';

var recast = require('recast'),
    b = require('recast').types.builders,
    debug = require('debug')('looks:transformer'),
    assert = require('assert'),
    _ = require('lodash');


describe('VarTransformer', function() {

  var GatherDeclarations = recast.Visitor.extend({
    visitFunctionDeclaration: function(stmt) {
      var body = stmt.body,
          newBody,
          declarations,
          newDeclarators,
          newDeclaration;

      if (body.type && body.type === 'BlockStatement') {
        body = body.body;
      }

      newBody = _.filter(body, function(node) {
        return node.type !== 'VariableDeclaration';
      });

      declarations = _.filter(body, function(node) {
        return node.type === 'VariableDeclaration';
      });

      body.length = 0;

      newDeclarators = _.chain(declarations)
        .pluck('declarations')
        .flatten()
        .map(function(d) {
          return b.variableDeclarator(d.id, d.init);
        })
        .sortBy(function(decl) {
          return +(decl.init === null);
        })
        .value();

      newDeclaration = b.variableDeclaration('var', newDeclarators);

      body.push(newDeclaration);
      _.forEach(newBody, function(part) {
        body.push(part);
      });

      return stmt;
    }
  });


  var SortDeclarationsByName = recast.Visitor.extend({

    visitVariableDeclaration: function(node) {
      var newDeclarators;
      newDeclarators = _.sortBy(node.declarations, function(decl) {
        return decl.id.name;
      });
      return b.variableDeclaration('var', newDeclarators);
    }
  });


  var SortDeclarationsByInit = recast.Visitor.extend({
    visitVariableDeclaration: function(node) {
      var newDeclarators;
      newDeclarators = _.sortBy(node.declarations, function(decl) {
        return +(decl.init === null);
      });
      return b.variableDeclaration('var', newDeclarators);
    }
  });


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
