'use strict';

var request = require('request');
var cheerio = require('cheerio');
var htmlToText = require('html-to-text');
var Stream = require('string-stream');
var pager = require('default-pager');

var url = 'https://medium.com/@googleforwork/one-googler-s-take-on-managing-your-time-b441537ae037';

function getTextFromHtml(html) {
	return htmlToText.fromString(html);
}

function printArticle(content) {
	var readStream = new Stream(content);
	readStream.pipe(pager(function () {
		console.log('(END)');
	}));
}

function processHtml(html) {
	var $ = cheerio.load(html);
	var articleMarkup = $('main.postArticle-content').html();
	var content = getTextFromHtml(articleMarkup);
	printArticle(content);
}

request(url, function(err, res, body) {
	if (!err && res.statusCode == 200) {
		processHtml(body);
	}
});
