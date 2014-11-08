'use strict';

var recast = require('recast'),
    debug = require('debug')('looks:printer'),
    Printer = require('../lib/printer'),
    fromString = require('recast/lib/lines').fromString,
    namedTypes = require('recast/lib/types').namedTypes,
    assert = require('assert');

describe('Printer', function() {

  it('accepts printers for specific node types', function() {
    var printer = new Printer(),
        printFile,
        printResult;

    printFile = function(node) {
      return fromString('//js program here');
    };

    printer.register('File', printFile);
    printResult = printer.print(recast.parse('a + b'));

    assert.equal('//js program here', printResult.toString());
  });


  it('sets the context right', function() {
    var printer = new Printer(),
        printFile,
        printProgram,
        printResult;


    printFile = function(node) {
      return this.print(node.program);
    };

    printProgram = function(node) {
      return fromString('// program');
    };


    printer.register('File', printFile);
    printer.register('Program', printProgram);
    printResult = printer.print(recast.parse('a+b'));

    assert.equal('// program', printResult.toString());
  });


  it('can format simple binary expression', function() {
    var printer = new Printer(),
        printFile,
        printProgram,
        printExpression,
        printBinaryExpression,
        printIdentifier,
        printResult;

    printFile = function(node) { return this.print(node.program); };
    printProgram = function(node) { return this.print(node.body); };

    printExpression = function(node) {
      return concat([
        this.print(node.expression),
        fromString(';')
      ]);
    };

    printBinaryExpression = function(node) {
      debug('binary', node);
      return concat([
        this.print(node.left),
        fromString(' ' + node.sign + ' '),
        this.print(node.right)
      ]);
    };

    printIdentifier = function(node) {
      return fromString(node.name);
    };

    printer.register('File', printFile);
    printer.register('Program', printProgram);
    printer.register('Expression', printExpression);
    printer.register('BinaryExpression', printBinaryExpression);
    printer.register('Identifier', printIdentifier);

    printResult = printer.print(recast.parse('a+b'));

    assert('a + b;', printResult.toString());
  });
});
