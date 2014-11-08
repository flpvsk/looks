'use strict';

var _ = require('lodash'),
    recast = require('recast'),
    _isUseStrict,
    _isFunctionDeclaration,
    _isVariableDeclaration,
    SortBodyByPriority;


_isUseStrict = function(node) {
  return (
    node.type === 'ExpressionStatement' &&
    node.expression.value === 'use strict'
  );
};


_isFunctionDeclaration = function(node) {
  return node.type === 'FunctionDeclaration';
};


_isVariableDeclaration = function(node) {
  return node.type === 'VariableDeclaration';
};


/**
 * Sort function/module body by priority.
 *
 *   - use strict;
 *   - Function Declarations
 *   - Variable Declarations
 *   - everything else
 */
SortBodyByPriority = recast.Visitor.extend({

  _doSort: function(node) {
    var body = node.body.body || node.body,
        bodyByPriority;

    this.genericVisit(node);

    bodyByPriority = _.map(body, function(node) {
      if (_isUseStrict(node)) {
        return [0, node];
      }


      if (_isFunctionDeclaration(node)) {
        return [1, node];
      };


      if (_isVariableDeclaration(node)) {
        return [2, node];
      };

      return [3, node];
    });


    body = _.chain(bodyByPriority)
      .sortBy(function(pair) { return pair[0]; })
      .map(function(pair) { return pair[1]; })
      .value();

    if (node.body.body) {
      node.body.body = body;
    }

    if (!node.body.body) {
      node.body = body;
    }
  },


  visitFunctionDeclaration: function(node) {
    return this._doSort(node);
  },


  visitProgram: function(node) {
    return this._doSort(node);
  }
});


module.exports = SortBodyByPriority;
