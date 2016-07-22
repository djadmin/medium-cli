'use strict';
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var Q = require('q');

var MEDIUM_HOST = 'https://medium.com/';

// Fetches data from medium website
function fetchStories(modifier, value, latest, cb) {
	var url = MEDIUM_HOST;
	var fmjs = '?format=json';

	// build url
	if (modifier === 'top') {
		url += 'browse/top' + fmjs;
	} else if (modifier === 'author') {
		url += '@' + value + '/latest' + fmjs;
	} else if (modifier === 'tag') {
		url += 'tag/' + value;
		url += latest ? '/latest' + fmjs : fmjs;
	}

	request(url, function (err, res) {
		if (!err && res.statusCode == 200) {
			// Strip out while(1) prepended to res
			var data = JSON.parse(res.body.replace('])}while(1);</x>', ''));
			cb(data);
			// statusCode is 404 if the user doesn't exist
		} else if (res.statusCode == 404) {
			console.log(value + ' is not a valid Medium author.');
			process.exit(1);
		}
	});
}

function getContent(modifier, value, latest, cb) {
	fetchStories(modifier, value, latest, cb);
}

// Number conversion util fn
function kFormatter(num) {
    return num > 999 ? (num/1000).toFixed(1) + 'k' : num
}

// Pre processing
function processContent(data, modifier, count) {
	var isTag = modifier === 'tag';
	var streamItems = isTag ? data.payload.value : data.payload.streamItems;
	var postMap = data.payload.references.Post,
		userMap = data.payload.references.User,
		collection = data.payload.references.Collection;

	var stories = [];
	for (var i = 0, len = Math.min(count, streamItems.length); i < len; i++) {
		var post;
		var item = streamItems[i];

		// get post when given tag
		if (isTag) {
			post = item;
		// get post when given author (which has a postPreview prop)
		} else if (item.hasOwnProperty('postPreview')) {
			post = postMap[item.postPreview.postId];
		// get post when browsing top (which has a bmPostPreview prop)
		} else if (item.hasOwnProperty('bmPostPreview')) {
			post = postMap[item.bmPostPreview.postId];
		// ignore and don't count if it's not actually a post
		} else {
			count++;
			continue;
		}
		var user = userMap[post.creatorId];
		var collectionRef;
		if (post.homeCollectionId !== '') {
			collectionRef = collection[post.homeCollectionId];
		}

		var authorSlug = user.username;
		// Generate Url
		var urlPrefix = '';
		if (collectionRef) {
			urlPrefix = collectionRef.domaincollection ? collectionRef.domain :
				(MEDIUM_HOST + collectionRef.slug);
		} else {
			urlPrefix = MEDIUM_HOST + '@' + authorSlug;
		}

		var story = {
			url: urlPrefix + '/' + post.uniqueSlug,
			authorName: user.name,
			authorSlug: authorSlug,
			time: post.virtuals.createdAtRelative,
			readingTime: Math.ceil(post.virtuals.readingTime) + ' min read',
			headline: post.title,
			votes: kFormatter(post.virtuals.recommends)
		};
		stories.push(story);
	}

	return stories;
}

function getStories(count, modifier, value, latest) {
	var deferred = Q.defer();

	getContent(modifier, value, latest, function (res) {
		if (!res) {
			return deferred.reject();
		}
		var posts = processContent(res, modifier, count);
		deferred.resolve(posts);
	});
	return deferred.promise;
}

module.exports = {
	getStories: getStories
};
