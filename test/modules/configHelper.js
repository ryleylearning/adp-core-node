'use strict';
require('chai').should();

var configHelper = require('../../lib/configHelper');
var pathToConfig = __dirname + '/../lib/config.zip';

describe('Config helper module tests', function describeCb(){

	it('Should fail to return file with invalid JSON.', function itCb(done) {
		var configFile = 'config/invalid.json';
		function theCb(err) {
			done();
		}
		configHelper.extractFromZip(pathToConfig, configFile, theCb, theCb);
	});

	it('Should fail to return file that does not exist in config.', function itCb(done) {
		function theCb(err) {
			done();
		}
		configHelper.extractFromZip(pathToConfig, 'invalidFileName', theCb, theCb);
	});

	it('Should fail to find config when config file path is invalid.', function itCb(done) {
		var configFile = 'config/invalid.json';
		function theCb(err) {
			done();
		}
		configHelper.extractFromZip('bogus', configFile, theCb, theCb);
	});
});
