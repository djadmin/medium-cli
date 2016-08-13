'use strict';

var chalk = require('chalk');
var inquirer = require('inquirer');
var opener = require('open');

var post = require('./post');
var reader = require('./reader');

// Option to disable Chalk colors
// chalk = new chalk.constructor({enabled: false});

function constructChoices(posts) {
	var choices = [];
	var space = ' ', separator = '- ';
	posts.forEach(function (post, index) {
		var line = '';
		var number = (index + 1 < 10) ? ' ' + (index + 1) + '.' : (index + 1) + '.',
			headline = post.headline.replace(/[\n\r]/g, ' '),
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

function listTrendingPosts(posts, options) {
	var choices = constructChoices(posts);
	var open = options.open || false;
	inquirer.prompt([{
		type: 'list',
		name: 'url',
		// message: 'Medium - Top Stories',
		message: 'Select the article to read :',
		choices: choices,
		pageSize: 20
	}], function (answers) {
		var url = answers.url;
		open ? opener(url) : reader.show(url);
	});
}

function ls(modifier, options) {
	post.getStories(modifier, options).then(function (posts) {
		if (!posts.length) {
			console.log('No posts found, sorry');
			process.exit(1);
		}
		listTrendingPosts(posts, options);
	}, function (err) {
		console.log('Oops! Something went wrong! %s', err);
	});
}

module.exports = ls;
