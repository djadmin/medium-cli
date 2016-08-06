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
	.option('-n, --number <int>', 'specify number of stories')
	.action(function(options){
		var count = options.number || 20;
		list(count, 'top');
	});

program
	.command('tag')
	.arguments('<tag>')
	.description('List trending Medium Stories by tag')
	.option('-n, --number <int>', 'specify number of stories')
	.option('-l, --latest', 'get latest instead of trending stories')
	.action(function(tag, options){
		var count = options.number || 10;
		var latest = options.latest || false;
		list(count, 'tag', tag, latest);
	});

program
	.command('author')
	.arguments('<author>')
	.description('List Medium Stories by author')
	.option('-n, --number <int>', 'specify number of stories')
	.action(function(author, options){
		var count = options.number || 10;
		list(count, 'author', author);
	});

program
	.command('search')
	.alias('s')
	.arguments('<searchTerms...>')
	.description('Search for stories')
	.option('-n, --number <int>', 'specify number of stories')
	.action(function(searchTerms, options){
		var count = options.number || 10;
		list(count, 'search', searchTerms.join('%20'))
	});

program
	.command('read <url>')
	.description('Read the story right in your terminal')
	.action(function(url){
		reader.show(url);
	});

program
	.command('open <url>')
	.description('Opens it in your default browser')
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
