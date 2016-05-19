#!/usr/bin/env node
'use strict';
var path = require('path');
var program = require('commander');

var list = require('./lib/list');
var reader = require('./lib/reader');
var open = require('open');

var pkg = require(path.join(__dirname, 'package.json'));

program
	.version(pkg.version)
	.description(pkg.description);

program
	.command('top')
	.description('List Medium Top Stories')
	.option('-n, --number <int>", "specify number of stories')
	.action(function(options){
		var count = options.number || 20;
		list.top(count);
	});


program
	.command('read <url>')
	.description('Read the story right in your terminal')
	.action(function(url){
		reader.show(url);
	});

program
	.command('open <url>')
	.description('Opens it in your defaut browser')
	.option('-a, --app <application>', 'specify app to open the url. Eg: firefox')
	.action(function(url, options){
		var app = options.app || '';
		open(url, app);
	});

program.parse(process.argv);

if (!process.argv.slice(2).length) {
	// Show help by default
	program.outputHelp();
}
