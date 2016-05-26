'use strict';
require('chai').should();

var mockServer = require('../lib/mockServer');
var mockConnection = require('../lib/mockConnection');
var mockAppConfig = require('../lib/mockAppConfig');
var post = require('../../lib/post');
var fs = require('fs');
var app;
describe('Post module tests', function describeCb(){

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

	it('Handles successful post request', function itCb(done) {
		var opts = {
			url: 'http://localhost:55555/testsuccess',
			headers: {},
			payload: {},
			requestDesc: 'test success'
		};
		post(opts, function postCb(err, body) {
			body.value.should.equal(1);
			done();
		});
	});

	it('Handles failed post request', function itCb(done) {
		var opts = {
			url: 'http://localhost:55555/testfailone',
			headers: {},
			payload: {},
			requestDesc: 'test fail one'
		};
		post(opts, function postCb(err) {
			err.statusCode.should.equal(500);
			done();
		});
	});

	it('Handles successful post request with invalid json', function itCb(done) {
		var opts = {
			url: 'http://localhost:55555/testfailtwo',
			headers: {},
			payload: {},
			requestDesc: 'test fail two'
		};
		post(opts, function postCb(err) {
			err.statusCode.should.equal(200);
			done();
		});
	});


	it('Handles http exception - invalid url', function itCb(done) {
		var opts = {
			url: 'localhost:55555/testfailtwo',
			headers: {},
			payload: {},
			requestDesc: 'test fail two'
		};
		post(opts, function postCb(err) {
			err.statusCode.should.equal(0);
			done();
		});
	});

});

