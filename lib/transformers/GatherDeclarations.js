var _ = require('lodash'),
    recast = require('recast'),
    b = require('recast').types.builders,
    GatherDeclarations;

GatherDeclarations = recast.Visitor.extend({
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

module.exports = GatherDeclarations;
