'use strict';

var path = require('path'),
    fs = require('fs'),
    recast = require('recast'),
    run, parseArgs, args;


parseArgs = function parseArgs(argv) {
  var start, style, file;

  argv.forEach(function(arg, i) {
    if (path.basename(arg) === 'looks.js') {
      start = i;
    }
  });

  style = argv[start + 1],
  file = argv[start + 2];


  if (!style) {
    console.error('Codestyle is required');
    process.exit(1);
  }

  if (!file) {
    console.error('File is required');
    process.exit(1);
  }

  return [style, file];

};


run = function run(style, file) {
  var codestyle = require(path.join('../lib/codestyles', style)),
      ast,
      result;

  fs.readFile(file, function(err, code) {
    if (err) {
      console.error(err.stack);
      process.exit(1);
    }


    ast = recast.parse(code);
    codestyle.transformer.visit(ast);
    result = codestyle.printer.print(ast);

    process.stdout.write(result);
  });
};


run.apply(undefined, parseArgs(process.argv));
