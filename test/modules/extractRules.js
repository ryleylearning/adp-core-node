'use strict';
require('chai').should();
var extractRules = require('../../lib/extractRules');

describe('Extract rules failure test', function describeCb() {
	it('Should return empty array', function itCb(done) {
		var rules = extractRules();
		rules.length.should.equal(0);
		done();
	});
});
