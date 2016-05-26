'use strict';
require('chai').should();

var mockServer = require('../lib/mockServer');
var mockConnection = require('../lib/mockConnection');
var mockAppConfig = require('../lib/mockAppConfig');
var consumerApp = require('../../lib/consumerApplicationInstance');
var fs = require('fs');
var eventPayload;
var app;
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
		app = consumerApp(mockConnection, mockAppConfig());
		app.exec('test_get', {}, function execCb(err, data) {
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

	it('Get an event payload', function itCb(done) {
		app = consumerApp(mockConnection, mockAppConfig());
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

	it('Save an event', function itCb(done) {
		app.saveEvent(eventPayload, function execCb(err, data) {
			data.value.should.equal(1);
			done();
		});
	});

	it('Fail validations while saving an event', function itCb(done) {
		eventPayload.events[0].data.transform.worker.person.legalAddress.cityName = '';
		app.saveEvent(eventPayload, function execCb(err, data) {
			err.length.should.equal(2);
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

});

