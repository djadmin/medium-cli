#!/usr/bin/env node

var path = require('path');
var pkg = require(path.join(__dirname, 'package.json'));

// Parse command line options
var program = require('commander');

program
	.version(pkg.version)
	.description(pkg.description)
	.option('-n, --number <number>', 'Get only top stories', parseInt)
	.parse(process.argv);

if (program.number) {
	console.log('Fetch top %s stories', program.number);
}
