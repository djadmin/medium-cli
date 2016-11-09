'use strict';

var rp = require('request-promise');
var cheerio = require('cheerio');
var htmlToText = require('html-to-text');
var Stream = require('string-stream');
var pager = require('default-pager');
var html2commonmark = require('html2commonmark');
var mdlogBuilder = require('mdlog');

// var url = 'https://medium.com/@googleforwork/one-googler-s-take-on-managing-your-time-b441537ae037';

function getTextFromHtml(html) {
	return htmlToText.fromString(html);
}

function getMarkdownFromHtml(html) {
	//return toMarkdown(html);
	var converter = new html2commonmark.JSDomConverter({
            rawHtmlElements: [],
            ignoredHtmlElements: ['body', 'div', 'section', 'figure', 'figcaption'],
            interpretUnknownHtml: true
        });
	var renderer = new html2commonmark.Renderer();
	var ast = converter.convert(html);
	var markdown = renderer.render(ast); 
	return markdown;
}

function printArticle(content) {
	var readStream = new Stream(content);
	readStream.pipe(pager(function () {
		console.log('(END)');
	}));
}

function printMarkdown(content) {
	var mdlog = mdlogBuilder();
	mdlog(content);
}

function parseContent(options) {
	var $ = cheerio.load(options.html);
	var articleMarkup = $('.postArticle-content').html();
	var content = options.markdown ? getMarkdownFromHtml(articleMarkup) : getTextFromHtml(articleMarkup);
	return content;
}

function requestContent(url) {
	return rp(url);
}

// Show Content to user
function showContent(options) {
	requestContent(options.url).then(function (body) {
		var content = parseContent({html: body, markdown: options.markdown});
		options.markdown ? printMarkdown(content) : printArticle(content);
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

function show(options) {
	// Stop validating url as medium now allows custom urls
	// if (!validateUrl(url)) {
	// 	console.log('Sorry! Only Medium articles are allowed!');
	// 	return;
	// }
	showContent(options);
}

module.exports = {
	show: show
};
