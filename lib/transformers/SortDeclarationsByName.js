'use strict';

var _ = require('lodash'),
    recast = require('recast'),
    b = require('recast').types.builders,
    SortDeclarationsByName;

SortDeclarationsByName = recast.Visitor.extend({

  visitVariableDeclaration: function(node) {
    var newDeclarators;
    newDeclarators = _.sortBy(node.declarations, function(decl) {
      return decl.id.name;
    });
    return b.variableDeclaration('var', newDeclarators);
  }
});

module.exports = SortDeclarationsByName;
