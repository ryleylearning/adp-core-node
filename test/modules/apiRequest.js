'use strict';
require('chai').should();

var mockServer = require('../lib/mockServer');
var mockConnection = require('../lib/mockConnection');
var mockAppConfig = require('../lib/mockAppConfig');
var consumerApp = require('../../lib/consumerApplicationInstance');
var fs = require('fs');
var app;
describe('API Request module tests', function describeCb(){

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

	it('Hndles error response', function itCb(done) {
		app = consumerApp(mockConnection, mockAppConfig());
		app.exec('test_fail_one', {}, function execCb(err) {
			err.message.should.equal('mock app.test_fail_one responded with status code 500');
			done();
		});
	});

	it('Successful GET request with invalid json response', function itCb(done) {
		app = consumerApp(mockConnection, mockAppConfig());
		app.exec('test_fail_two', {}, function execCb(err) {
			err.message.should.equal('Invalid JSON. mock app.test_fail_two responded with status code 200');
			done();
		});
	});

	it('Executes a DELETE API', function itCb(done) {
		app = consumerApp(mockConnection, mockAppConfig());
		app.exec('test_delete', {}, function execCb(err, data) {
			data.value.should.equal(1);
			done();
		});
	});

	it('Executes a DELETE API', function itCb(done) {
		var badConn = {
			connType: {
				clientId: '88a73992-07f2-4714-ab4b-de782acd9c4d',
				clientSecret: 'a130adb7-aa51-49ac-9d02-0d4036b63541',
				apiUrl: 'localhost:55555',
				tokenUrl: 'http://localhost:55555/auth/oauth/v2/token',
				authorizationUrl: 'http://localhost:55555/auth/oauth/v2/authorize',
				sslKeyPath: 'test/test.key',
				sslCertPath: 'test/test.pem',
				granttype: 'client_credentials'
			},
			accessToken: 'someAccessTokenValue',
			connect: function connect() {}
		};
		app = consumerApp(badConn, mockAppConfig());
		app.exec('test_delete', {}, function execCb(err) {
			err.statusCode.should.equal(0);
			done();
		});
	});

});

