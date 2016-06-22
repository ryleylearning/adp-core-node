'use strict';
require('chai').should();

var mockServer = require('../lib/mockServer');
var mockConnection = require('../lib/mockConnection');
var mockAppConfig = require('../lib/mockAppConfig');
var event = require('../../lib/event');
var fs = require('fs');
var testEvent;
var testEventTwo;
var testEventThree;

describe('Event module tests', function describeCb(){

	before(function beforeCb(done) {
		try{
			fs.unlinkSync('./meta/testmeta.json');
		} catch(e) {
			// do nothing.
		}
		mockServer.start(done);
	});

	after(function afterCb(done) {
		mockServer.stop(done);
	});

	it('Initializes an event', function itCb(done) {
		var opts = {
			conn: mockConnection,
			apiInfo: mockAppConfig().calls[0],
			schemaLocation: '../test/lib/'
		};
		var myEvent = event(opts);
		myEvent.init(function initCb(err) {
			(err === null).should.equal(true);
			done();
		});
	});

	it('Initializes a second event', function itCb(done) {
		var opts = {
			conn: mockConnection,
			apiInfo: mockAppConfig().calls[1],
			schemaLocation: '../test/lib/'
		};
		testEventTwo = event(opts);
		testEventTwo.init(function initCb() {
			testEventTwo.validate(done);
		});
	});


	it('Initializes a third event', function itCb(done) {
		var opts = {
			conn: mockConnection,
			apiInfo: mockAppConfig().calls[2],
			schemaLocation: '../test/lib/'
		};
		testEventThree = event(opts);
		testEventThree.init(function initCb() {
			testEventThree.validate(done);
		});
	});

	it('Initializes an event from local source', function itCb(done) {
		var opts = {
			conn: mockConnection,
			apiInfo: mockAppConfig().calls[0],
			schemaLocation: '../test/lib/'
		};
		testEvent = event(opts);
		testEvent.init(function initCb(err) {
			(err === null).should.equal(true);
			done();
		});
	});

	it('Exposes validate method ', function itCb(done) {
		(typeof testEvent.validate).should.equal('function');
		var payload = testEvent.getPayload();
		payload.events[0].data.transform.worker.person.legalAddress.cityName = '';
		payload.events[0].data.transform.worker.person.legalAddress.postalCode = '1234512345612121';
		payload.events[0].data.transform.worker.person.legalAddress.countryCode = 'US';
		testEvent.setPayload(payload);
		testEvent.validate(function validateCb(err, validationErrors) {
			validationErrors.length.should.equal(7);
			done();
		});
	});


	it('Exposes validate method ', function itCb(done) {
		(typeof testEvent.validate).should.equal('function');
		var payload = testEvent.getPayload();
		payload.events[0].data.transform.worker.person.legalAddress.cityName = '';
		payload.events[0].data.transform.worker.person.legalAddress.postalCode = '1234512345612121';
		payload.events[0].data.transform.worker.person.legalAddress.countryCode = 'AA';
		testEvent.setPayload(payload);
		testEvent.validate(function validateCb(err, validationErrors) {
			validationErrors.length.should.equal(5);
			done();
		});
	});

	it('Exposes buildFinalPayload method ', function itCb(done) {
		(typeof testEvent.buildFinalPayload).should.equal('function');
		testEvent.buildFinalPayload();
		done();
	});

	it('Exposes getAPIInfo method ', function itCb(done) {
		(typeof testEvent.getAPIInfo).should.equal('function');
		var info = testEvent.getAPIInfo();
		info.methodName.should.equal('test_event');
		done();
	});

	it('Exposes getEventId method ', function itCb(done) {
		(typeof testEvent.getEventId).should.equal('function');
		var info = testEvent.getEventId();
		(typeof info).should.equal('string');
		done();
	});

	it('Exposes getPayload method ', function itCb(done) {
		(typeof testEvent.getPayload).should.equal('function');
		var info = testEvent.getPayload();
		info.eventId.should.equal(testEvent.getEventId());
		done();
	});

	it('Exposes getEventContext method ', function itCb(done) {
		(typeof testEvent.getEventContext).should.equal('function');
		var info = testEvent.getEventContext();
		(typeof info).should.equal('object');
		done();
	});

	it('Exposes setPayload method ', function itCb(done) {
		(typeof testEvent.setPayload).should.equal('function');
		testEvent.setPayload(testEvent.getPayload());
		done();
	});

	it('Fails to initialize an event from local source that has expired', function itCb(done) {
		var opts = {
			conn: mockConnection,
			apiInfo: mockAppConfig().calls[0],
			schemaLocation: '../test/lib/'
		};
		var testMeta = require('../../meta/88a73992-07f2-4714-ab4b-de782acd9c4d.testmeta.json');
		testMeta.expiration = new Date('01/01/2000');
		testEvent = event(opts);
		testEvent.init(function initCb(err) {
			(err === null).should.equal(true);
			done();
		});
	});

});

