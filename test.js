'use strict';

var fs = require('fs');
var jszip = require('jszip');

fs.readFile('test.zip', function(err, data) {
	if (err) throw err;
	jszip.loadAsync(data).then(function(zip) {
		zip.file('test/coverage.html').async('string').then(function(str) {
			console.log(str);
		});
	});
});
