'use strict';
require('chai').should();

var ConfigurationException = require('../lib/configurationException');

describe('Configuration Exception module tests', function describeCb(){

	it('Should return exception object.', function itCb(done) {
		var errObj = {
			description: 'Missing Configuration',
			message: 'Missing x value.'
		}
		var ex = new ConfigurationException(errObj);
		(ex.message).should.equal('Missing x value.');
		console.log(ex);
		done();
	});

	it('Should return default exception object.', function itCb(done) {
		var errObj = {}
		var ex = new ConfigurationException(errObj);
		(ex.message).should.equal('Unknown Configuration Error');
		console.log(ex);
		done();
	});
});