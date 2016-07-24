'use strict';

var rp = require('request-promise');
var cheerio = require('cheerio');
var htmlToText = require('html-to-text');
var Stream = require('string-stream');
var pager = require('default-pager');
// var urlParser = require('url');

// var url = 'https://medium.com/@googleforwork/one-googler-s-take-on-managing-your-time-b441537ae037';

function getTextFromHtml(html) {
	return htmlToText.fromString(html);
}

function printArticle(content) {
	var readStream = new Stream(content);
	readStream.pipe(pager(function () {
		console.log('(END)');
	}));
}

function parseContent(html) {
	var $ = cheerio.load(html);
	var articleMarkup = $('main.postArticle-content').html();
	var content = getTextFromHtml(articleMarkup);
	return content;
}

function requestContent(url) {
	return rp(url);
}

// Show Content to user
function showContent(url) {
	requestContent(url).then(function (body) {
		var content = parseContent(body);
		printArticle(content);
	}, function () {
		console.log('Oops! Something went wrong!');
	});
}

// function validateUrl (url) {
// 	if (urlParser.parse(url).host === 'medium.com') {
// 		return true;
// 	}
// 	return false;
// }

function show(url) {
	// Stop validating url as medium now allows custom urls
	// if (!validateUrl(url)) {
	// 	console.log('Sorry! Only Medium articles are allowed!');
	// 	return;
	// }
	showContent(url);
}

module.exports = {
	show: show
};
