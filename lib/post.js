'use strict';
var request = require('request');
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
	} else if (modifier === 'search') {
		url += 'search?q=' + value;
		url += '&' + fmjs.slice(1);
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
	var items = [];
	var stories = [];
	var postMap = data.payload.references.Post;
	var userMap = data.payload.references.User;
	var collection = data.payload.references.Collection;
	var item, post, collectionRef, user, authorSlug, urlPrefix, story, prop;

	// get items from json response
	switch (modifier) {
		case 'tag':
			items = data.payload.streamItems;
			break;
		case 'search':
			items = data.payload.value.posts;
			break;
		case 'author':
		case 'top':
			items = data.payload.streamItems;
			break;
	}

	// build stories array
	for (var i = 0, len = Math.min(count, items.length); i < len; i++) {
		item = items[i];
		if (['tag', 'search'].indexOf(modifier) !== -1) {
			post = postMap[item.postPreview.postId];
		} else {
			if (modifier === 'author') {
				prop = 'postPreview';
			} else {
				prop = 'bmPostPreview';
			}
			try {
				post = postMap[item[prop].postId];
			} catch(e) {
				// don't count the item if it's not a post
				if (len < count) { len++; }
				continue;
			}
		}

		var user = userMap[post.creatorId];
		var collectionRef;

		if (post.homeCollectionId !== '') {
			collectionRef = collection[post.homeCollectionId];
		}

		authorSlug = user.username;
		// Generate Url
		urlPrefix = '';
		if (collectionRef) {
			urlPrefix = collectionRef.domaincollection ? collectionRef.domain :
				(MEDIUM_HOST + collectionRef.slug);
		} else {
			urlPrefix = MEDIUM_HOST + '@' + authorSlug;
		}

		story = {
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

function getStories(modifier, options) {
	var deferred = Q.defer();
	var value = options.value, latest = options.latest;
	getContent(modifier, value, latest, function (res) {
		if (!res) {
			return deferred.reject();
		}
		var posts = processContent(res, modifier, options.count);
		deferred.resolve(posts);
	});
	return deferred.promise;
}

module.exports = {
	getStories: getStories
};
