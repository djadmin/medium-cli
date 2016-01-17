#!/usr/bin/env node
'use strict';

var program = require('commander');
var op = require('open');

program
	.arguments('<number>')
	.action(function (url) {
		// TODO : Validate url
		op(url);
	})
	.parse(process.argv);
