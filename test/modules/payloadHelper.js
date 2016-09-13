
'use strict';
require('chai').should();

var payloadHelper = require('../../lib/payloadHelper');

describe('Payload helper module tests', function describeCb(){

	it('Should return output as input when meta is not passed.', function itCb(done) {
		var input = {some: 'data'};
		var output = payloadHelper.removePropsNotSet(input, undefined, undefined);
		output.should.equal(input);
		done();
	});
});


