'use strict';
var request = require('request');
var Q = require('q');

var MEDIUM_HOST = 'https://medium.com/';

// Fetches data from medium website
function fetchTopStories(cb) {
	request('https://medium.com/browse/top?format=json', function (err, res) {
		if (!err && res.statusCode == 200) {
			// Strip out while(1) prepended to res
			var data = JSON.parse(res.body.replace('])}while(1);</x>', ''));
			cb(data);
		}
	});
}

function getContent(cb) {
	fetchTopStories(cb);
}

// Number conversion util fn
function kFormatter(num) {
	return num > 999 ? (num/1000).toFixed(1) + 'k' : num
}

// Pre processing
function processContent(data, count) {
	var streamItems = data.payload.streamItems,
		postMap = data.payload.references.Post,
		userMap = data.payload.references.User,
		collection = data.payload.references.Collection;

	var stories = [];
	for (var i = 0, len = Math.min(count, streamItems.length); i < len; i++) {
		var item = streamItems[i],
			post = postMap[item.bmPostPreview.postId],
			user = userMap[post.creatorId],
			collectionRef = collection[post.homeCollectionId];

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
