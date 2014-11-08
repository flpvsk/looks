'use strict';
var recast = require('recast'),
    ComposedTransformer;

ComposedTransformer = recast.Visitor.extend({
  init: function(transformers) {
    this._transformers = transformers.slice();
  },

  visit: function(node) {
    this._transformers.forEach(function(t) {
      t.visit(node);
    });
  }
});

module.exports = ComposedTransformer;
