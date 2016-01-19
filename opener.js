'use strict';

var openUrl = require('open');

function open(url, app) {
	openUrl(url, app);
}

// open(process.argv[2]);
module.exports = {
	open: open
};