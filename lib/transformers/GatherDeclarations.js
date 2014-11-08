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
  parentDeclarations: [],
  parentBlock: null,

  _visitVarContainer: function(node) {
    var body,
        declarations,
        accDeclarations,
        newDeclarators,
        newDeclaration,
        contentWithPriority;


    this.parentBlock = node;
    this.parentDeclarations.push([]);

    // visit function contents
    this.genericVisit(node);
    // at this moment all vars are pulled out of body
    body = node.body;


    // Group accumulated declarations into one
    accDeclarations = this.parentDeclarations.pop();
    if (!accDeclarations.length) return;

    newDeclarators = _.chain(accDeclarations)
      .pluck('declarations')
      .flatten()
      .map(function(d) {
        return b.variableDeclarator(d.id, d.init);
      })
      .value();

    newDeclaration = b.variableDeclaration('var', newDeclarators);

    if (body.body) {
      body.body.unshift(newDeclaration);
    }

    if (!body.body) {
      body.unshift(newDeclaration);
    }

    node.body = body;
  },


  visitProgram: function(node) {
    return this._visitVarContainer(node);
  },


  visitFunctionDeclaration: function(node) {
    return this._visitVarContainer(node);
  },


  visitBlockStatement: function(node) {
    this.parentBlock = node;
    return this.genericVisit(node);
  },


  visitVariableDeclaration: function(node) {
    var parentBody = this.parentBlock.body,
        parentDeclarations = this.parentDeclarations,
        forLoop,
        forDeclarations;

    parentDeclarations = parentDeclarations[parentDeclarations.length - 1];

    this.parentBlock.body = parentBody.filter(function(bNode) {
      return bNode !== node;
    });

    // if in `for loop`
    if (parentBody[0] && parentBody[0].init === node) {
      forLoop = parentBody[0];
      forDeclarations = forLoop.init.declarations;
      forDeclarations.forEach(function(d) {
        parentDeclarations.push(
          b.variableDeclaration(
            'var',
            [b.variableDeclarator(d.id, null)]
          )
        );
      });

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

    parentDeclarations.push(node);
    return this.genericVisit(node);
  }
});

module.exports = GatherDeclarations;
