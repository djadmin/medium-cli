'use strict';

var program = require('commander');
var reader = require('./reader');

// Commander API
program
	.arguments('<number>')
	.action(function (url) {
		reader.show(url);
	})
	.parse(process.argv);

