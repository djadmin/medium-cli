'use strict';
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var Q = require('q');

function fetchTopStories(cb) {
	request('https://medium.djadmin.in/top', function (error, response, content) {
	  if (!error && response.statusCode == 200) {
	    // saveContent(body);
	    cb(JSON.parse(content));
	  }
	});
}

// For Testing Purpose
function saveContent(html) {
	fs.writeFile("sample.html", html, function(err) {
	    if(err) {
	        return console.log(err);
	    }
	    console.log("The file was saved!");
	});
}

// For Testing Purpose
function readContent(cb) {
	fs.readFile('sample.html', function (err, html) {
		if (err) {
			return console.log(err);
		}
		cb(html);
	});
}

function getContent(cb) {
	fetchTopStories(cb);
	// readContent(cb);
}


function processContent(data, count) {
	var posts = [];
	for (var i = 0, len = Math.min(count, data.length); i < len; i++) {
		var article = data[i];
		var post = {
			url: article.time.href,
			authorName: article.author.text,
			authorSlug: article.author.href.match(/\@(.*)/)[1],
			time: article.time.text,
			readingTime: article.readTime,
			headline: article.headline,
			votes: article.votes
		};
		posts.push(post);
	}
	return posts;
}

function getTrending(count) {
	var deferred = Q.defer();

	getContent(function (res) {
		if (!res) {
			return deferred.reject();
		}
		var posts = processContent(res, count);
		deferred.resolve(posts);
	});
	return deferred.promise;
}

module.exports = {
	getTrending: getTrending
};
