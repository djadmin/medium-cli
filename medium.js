#!/usr/bin/env node
'use strict';
var path = require('path');
var pkg = require(path.join(__dirname, 'package.json'));
var post = require('./post');
var reader = require('./reader');
// Parse command line options
var program = require('commander');
var chalk = require('chalk');
var inquirer = require('inquirer');

//Disable Chalk colors
// chalk = new chalk.constructor({enabled: false});

function constructChoices(posts) {
	var choices = [];
	var space = ' ', separator = '--';
	posts.forEach(function (post, index) {
		var line = '';
		var number = (index + 1) + '.',
			headline = '"' + post.headline + '"',
			votes = post.votes + space + 'votes',
			author = 'by' + space + '@' + post.authorSlug;
		
		// construct article message
		line += chalk.gray(number) + space;
		line += chalk.yellow(headline) + space;
		line += chalk.green(separator + votes) + space;
		line += chalk.cyan(separator + author);
		
		var choice = {
			'name': line,
			'short': post.headline,
			'value': post.url
		};
		choices.push(choice);
		// new inquirer.Separator(),
	});
	return choices;
}

function listTrendingPosts(posts) {
		var choices = constructChoices(posts);
		inquirer.prompt([
			{
				type: 'list',
				name: 'url',
				// message: 'Medium - Top Stories',
				message: 'Select the article to read :',
				choices: choices,
				pageSize: 20
			}
		], function (answers) {
			var url = answers.url;
			reader.show(url);
		});
}

program
	.version(pkg.version)
	.description(pkg.description)
	.option('-n, --number <number>', 'Get only top stories', parseInt)
	.command('read <number>', 'Read the story in your terminal', parseInt)
	.command('open <number>', 'Open the story in browser', parseInt)
	.parse(process.argv);

if (program.number) {
	post.getTrending(program.number).then(function (posts) {
		listTrendingPosts(posts);
	}, function (err) {
		console.log('Oops! Something went wrong! %s', err);
	});
	console.log('Medium - Top %s stories...', program.number);
}

if (!process.argv.slice(2).length) {
	console.log('Going into default option');
	// Default Option
	post.getTrending().then(function (posts) {
		listTrendingPosts(posts);
	});
	console.log('Fetching top %s stories...', program.number);
}