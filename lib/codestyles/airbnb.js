'use strict';
var recast = require('recast'),
    ComposedTransformer = require('../transformers/ComposedTransformer'),
    GatherDeclarations = require('../transformers/GatherDeclarations'),
    SortDeclarations = require('../transformers/SortDeclarationsByInit'),
    transformers, printer;


transformers = [
  new GatherDeclarations(),
  new SortDeclarations()
];


printer = {
  print: function(ast) {
    return recast.prettyPrint(ast, {tabWidth: 2}).code.toString();
  }
};

module.exports.transformer = new ComposedTransformer(transformers);
module.exports.printer = printer;
