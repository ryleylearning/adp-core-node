'use strict';
require('chai').should();

var interpolate = require('../lib/interpolate');

describe('Interpolate module tests', function describeCb(){

	it('Should parse string variables and perform replacements.', function itCb(done) {
		var out = interpolate('some string with {variable} {vals} and other text', {variable: 'dynamic', vals: 'values'});
		(out).should.equal('some string with dynamic values and other text');
		done();
	});
});