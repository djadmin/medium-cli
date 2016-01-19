'use strict';

var chalk = require('chalk');
var inquirer = require('inquirer');

var post = require('./post');
var reader = require('./reader');


// Option to disable Chalk colors
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

function top(count) {
	post.getTrending(count).then(function (posts) {
		listTrendingPosts(posts);
	}, function (err) {
		console.log('Oops! Something went wrong! %s', err);
	});
}
module.exports = {
	top: top
};