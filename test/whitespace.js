'use strict';
var recast = require('recast'),
    Printer = require('recast/lib/printer').Printer,
    linesModule = require('recast/lib/lines'),
    fromString = linesModule.fromString,
    concat = linesModule.concat,
    assert = require('assert'),
    Class = require('cls'),
    debug = require('debug')('looks'),
    LooksPrinter;


LooksPrinter = Class.extend({
  print: function print(node) {
    var methodName = '',
        method;

    if (!node) {
      return fromString('');
    }


    if (Array.isArray(node)) {
      return this.printArray(node);
    };

    debug('about to print ' + (node && node.type));
    methodName = 'print' + node.type;
    method = this[methodName];

    if (method)  {
      return method.call(this, node);
    }

    return this.genericPrint(node);
  },


  printArray: function printArray(nodes) {
    return concat(
      nodes.map(function (node) {
        return this.print(node);
      }, this)
    );
  },


  printFile: function printFile(node) {
    debug('in print file');
    return this.print(node.program);
  },


  printProgram: function printProgram(node) {
    debug('in print program');
    return this.print(node.body);
  },


  printExpressionStatement: function printExpressionStatement(node) {
    debug('in print expression statement');
    return this.print(node.expression);
  },


  printIdentifier: function printIdentifier(node) {
    debug('in print identifier', node);
    return node.name;
  },


  genericPrint: function genericPrint(node) {
    debug('in generic print', node);
    return node.original.loc.lines;
  }

});


describe('SimplePrinter', function() {

  var MyPrinter = LooksPrinter.extend({
    printBinaryExpression: function visitBinaryExpression(node) {
      debug('Visit binary expression called with', node);
      return concat([
        this.print(node.left),
        ' ' + node.operator + ' ',
        this.print(node.right)
      ]);
    }
  });


  it('can fix whitespaces', function() {
    var code = "a  +b",
        expected = "a + b",
        printer = new MyPrinter(new Printer()),
        ast = recast.parse(code);

    assert.equal(printer.print(ast).toString(), expected);
  });

});
