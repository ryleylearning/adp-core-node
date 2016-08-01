'use strict';
require('chai').should();

var mockServer = require('../lib/mockServer');
var mockConnection = require('../lib/mockConnection');
// var mockAppConfig = require('../lib/mockAppConfig');
var consumerApp = require('../../lib/consumerApplicationInstance');
var fs = require('fs');
var eventPayload;
var app;
var pathToConfig = __dirname + '/../config.zip';

describe('Consumer Application Instance module tests', function describeCb(){

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

	it('Executes a GET API', function itCb(done) {
		app = consumerApp(mockConnection, pathToConfig);
		app.exec('test_get', {}, function execCb(err, data) {
			data.value.should.equal(1);
			done();
		});
	});

	it('Executes a GET API with null for opts', function itCb(done) {
		app = consumerApp(mockConnection, pathToConfig);
		app.exec('test_get', null, function execCb(err, data) {
			data.value.should.equal(1);
			done();
		});
	});

	it('Fails to execute an invalid method', function itCb(done) {
		app.exec('test_invalid', {}, function execCb(err) {
			err.message.should.equal('Invalid method name. Failed to find method `test_invalid`');
			done();
		});
	});

	it('Exposes getConsumerApplication method', function itCb(done) {
		(typeof app.getConsumerApplication).should.equal('function');
		var inst = app.getConsumerApplication();
		(typeof inst.calls.forEach).should.equal('function');
		done();
	});

	it('Exposes getConnection method', function itCb(done) {
		(typeof app.getConnection).should.equal('function');
		var inst = app.getConnection();
		(typeof inst.connect).should.equal('function');
		done();
	});

	it('Get event rules', function itCb(done) {
		app = consumerApp(mockConnection, pathToConfig);
		var opts = {
			methodName: 'test_event',
			schemaLocation: '../test/lib/'
		};
		app.getEventRules(opts, function execCb(err, rules) {
			try{
				rules.length.should.equal(7);
				(typeof rules.forEach).should.equal('function');
				done();
			}catch(e) {
				done(e);
			}

		});
	});

	it('Get an event payload', function itCb(done) {
		app = consumerApp(mockConnection, pathToConfig);
		var opts = {
			methodName: 'test_event',
			schemaLocation: '../test/lib/'
		};
		app.createEvent(opts, function execCb(err, payload) {
			eventPayload = payload;
			(typeof eventPayload.eventId).should.equal('string');
			done();
		});
	});

	it('Fail 8 validations while saving an event', function itCb(done) {
		app.saveEvent(eventPayload, function execCb(err) {
			err.length.should.equal(8);
			done();
		});
	});

	it('Save an event', function itCb(done) {
		eventPayload.events[0].data.eventContext.worker.associateOID = '123';
		eventPayload.events[0].data.transform.worker.person.legalAddress.countryCode = 'AA';
		eventPayload.events[0].data.transform.worker.person.legalAddress.postalCode = '123456';
		eventPayload.events[0].data.transform.worker.person.legalAddress.cityName = 'some city';
		eventPayload.events[0].data.transform.worker.person.legalAddress.lineOne = '123 st';
		eventPayload.events[0].data.transform.worker.person.legalAddress.lineTwo = 'Suite';
		eventPayload.events[0].data.transform.worker.person.legalAddress.lineThree = '123';
		eventPayload.events[0].data.transform.worker.person.legalAddress.lineFour = '123';
		eventPayload.events[0].data.transform.worker.person.legalAddress.lineFive = '123';
		eventPayload.events[0].data.transform.worker.person.legalAddress.countrySubdivisionLevel2 = {longName: '1231'};
		app.saveEvent(eventPayload, function execCb(err, data) {
			console.log(err);
			data.value.should.equal(1);
			done();
		});
	});

	it('Fail to save an event with invalid eventId', function itCb(done) {
		var badPayload = {
			eventId: '1234'
		};
		app.saveEvent(badPayload, function execCb(err) {
			err.message.should.equal('EventId not found or invalid eventId. EventId must not be altered or deleted from payload.');
			done();
		});
	});

	it('Fail to save an event with invalid eventId', function itCb(done) {
		var badPayload = {};
		app.saveEvent(badPayload, function execCb(err) {
			err.message.should.equal('Event must contain eventId property.');
			done();
		});
	});


	it('Receive event notification and delete message from queue.', function itCb(done) {
		app.getNextEvent(function getNextEventCb(err, msg) {
			done();
		});
	});

});

