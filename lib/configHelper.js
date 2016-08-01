/*
Copyright © 2015-2016 ADP, LLC.

Licensed under the Apache License, Version 2.0 (the “License”);
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an “AS IS” BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
express or implied.  See the License for the specific language
governing permissions and limitations under the License.
*/

'use strict';

var fs = require('fs');
var jszip = require('jszip');
var debug = require('./debug');
var ConfigurationException = require('./configurationException');
var APP_CONFIG_FILE_PATH = 'config/appConfig.json';
var SCHEMA_PATH = 'config/schemas/';

function extractAppConfig(configPath, setResults, finalCb, errCb) {
	function extractCb(parsed) {
		setResults(parsed);
		finalCb();
	}
	return extractFromZip(configPath, APP_CONFIG_FILE_PATH, errCb, extractCb);
}

function extractSchemaFile(configPath, schemaName, cb) {
	function extractCb(parsed) {
		cb(undefined, parsed);
	}
	return extractFromZip(configPath, SCHEMA_PATH + schemaName + '.json', cb, extractCb);
}

function extractFromZip(configPath, fileName, errCb, finalCb) {
	var configFile;
	try{
		configFile = fs.readFileSync(configPath);
		jszip.loadAsync(configFile).then(function loadAsyncCb(zip) {
			var file = zip.file(fileName);
			if(file === null) {
				debug('Unable to locate `' + fileName + '` in `' + configPath + '`');
				errCb(new ConfigurationException({description: 'Error finding application configuration', message: 'Unable to locate `' + fileName + '` in `' + configPath + '`'}));
			}
			file && file.async('string').then(function thenCb(str) {
				var parsed = JSON.parse(str);
				return parsed;
			}).then(finalCb).catch(function catchCb(e) {
				debug('Error parsing `' + fileName + '` in `' + configPath + '`. Error: ' + e);
				return errCb(new ConfigurationException({description: 'Error parsing application configuration', message: 'Error parsing `' + fileName + '` in `' + configPath + '`. Error: ' + e}));
			});
		});
	} catch(e) {
		debug('Unable to open file `' + configPath + '`. Error: ' + e);
		errCb(new ConfigurationException({description: 'Error opening application configuration', message: 'Unable to open file `' + configPath + '`. Error: ' + e}));
	}
}


module.exports = {
	extractAppConfig: extractAppConfig,
	extractSchemaFile: extractSchemaFile
};
