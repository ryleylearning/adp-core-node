'use strict';
require('chai').should();

var APIException = require('../lib/apiException');

describe('API Exception module tests', function describeCb(){

	it('Should return exception object.', function itCb(done) {
		var errObj = {
			statusCode: 302
		};
		var ex = new APIException(errObj);
		ex.statusDesc.should.equal('Found');
		done();
	});
});
