'use strict';

var _ = require('lodash'),
    recast = require('recast'),
    b = require('recast').types.builders,
    GatherDeclarations,
    declarationToAssignment;


declarationToAssignment = function(d) {
  return b.assignmentExpression(
    '=',
    d.id,
    d.init
  );
};

GatherDeclarations = recast.Visitor.extend({
  parentFunction: null,
  parentFunctionDeclarations: null,
  parentBlock: null,

  visitFunctionDeclaration: function(stmt) {
    var body = stmt.body,
        newBody,
        declarations,
        newDeclarators,
        newDeclaration;

    // save links to parentFunction and Declarations
    this.parentFunctionDeclarations = [];
    this.parentFunction = stmt;
    // visit function contents
    this.genericVisit(stmt);

    if (body.type && body.type === 'BlockStatement') {
      body = body.body;
    }

    newDeclarators = _.chain(this.parentFunctionDeclarations)
      .pluck('declarations')
      .flatten()
      .map(function(d) {
        return b.variableDeclarator(d.id, d.init);
      })
      .value();

    newDeclaration = b.variableDeclaration('var', newDeclarators);

    body.unshift(newDeclaration);
  },

  visitBlockStatement: function(node) {
    this.parentBlock = node;
    return this.genericVisit(node);
  },

  visitVariableDeclaration: function(node) {
    var parentBody = this.parentBlock.body,
        forLoop,
        forDeclarations;

    this.parentBlock.body = parentBody.filter(function(bNode) {
      return bNode !== node;
    });

    // if in `for loop`
    if (parentBody[0] && parentBody[0].init === node) {
      forLoop = parentBody[0];
      forDeclarations = forLoop.init.declarations;
      forDeclarations.forEach(function(d) {
        this.parentFunctionDeclarations.push(
          b.variableDeclaration(
            'var',
            [b.variableDeclarator(d.id, null)]
          )
        );
      }, this);

      if (forDeclarations.length === 1) {
        forLoop.init = declarationToAssignment(forDeclarations[0]);
      }

      if (forDeclarations.length > 1) {
        forLoop.init = b.sequenceExpression(
          forDeclarations.map(declarationToAssignment)
        );
      }
      return;
    }

    this.parentFunctionDeclarations.push(node);
    return this.genericVisit(node);
  }
});

module.exports = GatherDeclarations;
