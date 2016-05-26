'use strict';
require('chai').should();

var ConnectionException = require('../lib/connectionException');

describe('Connection Exception module tests', function describeCb(){

	it('Should return exception object.', function itCb(done) {
		var errObj = {
			statusCode: 302,
			oauthResponse: {
				error: 'invalid_scope'
			}
		};
		var ex = new ConnectionException(errObj);
		ex.statusDesc.should.equal('Found');
		done();
	});

	it('Should return default exception object.', function itCb(done) {
		var errObj = {};
		var ex = new ConnectionException(errObj);
		ex.statusDesc.should.equal('No Status Description');
		done();
	});
});
