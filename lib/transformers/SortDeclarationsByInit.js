var _ = require('lodash'),
    recast = require('recast'),
    b = require('recast').types.builders,
    SortDeclarationsByInit;

SortDeclarationsByInit = recast.Visitor.extend({
  visitVariableDeclaration: function(node) {
    var newDeclarators;
    newDeclarators = _.sortBy(node.declarations, function(decl) {
      return +(decl.init === null);
    });
    return b.variableDeclaration('var', newDeclarators);
  }
});

module.exports = SortDeclarationsByInit;
