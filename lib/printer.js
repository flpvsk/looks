'use strict';

var Class = require('cls'),
    debug = require('debug')('looks:printer'),
    error = require('debug')('looks:printer:error'),
    concat = require('recast/lib/lines').concat,
    _ = require('lodash'),
    Printer;


function PrinterConstructor() {
  this._printers = {};
  this._genericPrinters = [];
}


function register(nodeTypes, fn) {
  if (!nodeTypes || !nodeTypes.length) {
    error('Printer.register() called with no arguments!');
    throw new Error('Register takes at least one argument');
  }

  if (!fn) {
    fn = nodeTypes;
    nodeTypes = null;
  }

  if (fn && nodeTypes) {
    if (!Array.isArray(nodeTypes)) {
      nodeTypes = [nodeTypes];
    }
  }


  // Printer should be called for every node type, in case specific
  // printer not found
  if (!nodeTypes || !nodeTypes.length) {
    this._genericPrinters.push(fn);
    return this;
  }


  // Printer should be called for specific node type(s)
  _.forEach(nodeTypes, function(nodeType) {
    this._printers[nodeType] = this._printers[nodeType] || [];
    this._printers[nodeType].push(fn);
  }, this);

  return this;
};


function print(node) {
  var printers;

  if (_.isArray(node)) {
    return this.printArray(node);
  }

  printers = this._printers[node.type] || [];

  debug('printers for node type: "' + node.type + '"', printers);

  if (printers.length) {
    return concat(
      _.map(printers, function(printFn) {
        return printFn.call(this, node);
      }, this)
    );
  }
}


function printArray(nodes) {
  return concat(_.map(nodes, this.print, this));
};


Printer = Class.extend({
  init: PrinterConstructor,
  register: register,
  print: print,
  printArray: printArray
});


module.exports = Printer;
