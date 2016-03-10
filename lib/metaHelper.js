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

var objectPath = require('./objectPath');
var request = require('./apiRequest');
var fs = require('fs');
var _ = require('underscore');

function getMeta(conn, apicall, cb) {
	var options = {
		requestDesc: 'Meta.' + apicall.methodName,
		httpMethod: 'GET',
		url: conn.connType.apiUrl + apicall.metaPath,
		headers: {
			Authorization: 'Bearer ' + conn.accessToken
		},
		agentOptions: {
			ca: [fs.readFileSync(conn.connType.sslCertPath)],
			key: fs.readFileSync(conn.connType.sslKeyPath),
			cert: fs.readFileSync(conn.connType.sslCertPath)
		}
	};
	request(options, cb);
}

function getMetaObject(meta) {
	var metaRoot = 'events/0';
	var metaPaths = [];
	var watchedObjects = ['codeList'];
	var watchedProps = ['readOnly', 'optional', 'hidden', 'minItems', 'maxItems', 'minLength', 'maxLength', 'shortLabelName', 'pattern'];

	function cleanPath(pathtoclean) {
		var cleaned = pathtoclean.replace('transforms/0/', 'transform/');
		return cleaned;
	}

	function addToMetaPathArray(path, key, obj) {
		var cleanedPath = cleanPath(path);
		var pathObj = _.where(metaPaths, {path: cleanedPath})[0];
		if(pathObj) {
			pathObj.meta[key] = obj[key];
		} else {
			pathObj = {
				path: cleanedPath,
				meta: {}
			};
			pathObj.meta[key] = obj[key];
			metaPaths.push(pathObj);
		}
	}

	function buildMetaPaths(obj, paths) {

		Object.keys(obj).forEach(function keysForEach(key) {
			var appendedPath = '';
			if(~key.indexOf('/')) {
				appendedPath = paths + key;
				if(obj[key]) buildMetaPaths(obj[key], appendedPath);
			} else if(typeof obj[key] !== 'object') {
				if(~watchedProps.indexOf(key)) {
					addToMetaPathArray(paths, key, obj);
				}
			} else {
				if(~watchedObjects.indexOf(key)) {
					addToMetaPathArray(paths, key, obj);
				} else {
					appendedPath = paths + '/' + key;
					if(obj[key]) buildMetaPaths(obj[key], appendedPath);
				}
			}
		});
	}

	buildMetaPaths(meta.meta, metaRoot);

	return metaPaths;
}

function getPayloadDataPaths(data, dataPath) {
	var paths = [];

	function buildPayloadDataPaths(obj, path) {
		Object.keys(obj).forEach(function keysForEach(key) {
			var appendedPath = '';
			if(obj[key] && typeof obj[key] !== 'object') {
				appendedPath = path + '/' + key;
				paths.push(appendedPath);
			} else {
				appendedPath = path + '/' + key;
				if(obj[key]) buildPayloadDataPaths(obj[key], appendedPath);
			}
		});
	}
	buildPayloadDataPaths(data || {}, dataPath);
	return paths;
}

function validate(data, payload, metaPaths, dataPath) {
	var payloadDataPaths = [dataPath];
	if(typeof data !== 'string') {
		payloadDataPaths = getPayloadDataPaths(data, dataPath || '');
	}

	function minMaxLengthValidate(min, max, val) {
		try{
			if(val.length > max || val.length < min) {
				return false;
			}
			return true;
		} catch(e) {
			console.log('EXCEPTION', e);
			return false;
		}
	}

	function minMaxItemsValidate(min, max, coll) {
		try{
			if(coll.length > max || coll.length < min) {
				return false;
			}
			return true;
		} catch(e) {
			console.log('EXCEPTION', e);
			return false;
		}
	}

	function optionalValidate(optional, val) {
		try{
			if(optional === false) {
				if(val === null) {
					return false;
				}
				if(typeof val === 'string' && val.length <= 0) {
					return false;
				}
				if(typeof val === 'undefined') {
					return false;
				}
				return true;
			}
			return false;
		} catch(e) {
			console.log('EXCEPTION', e);
			return false;
		}
	}

	function readOnlyValidate(ro, val) {

	}

	function codeListsValidate(codeList, obj) {

	}

	function patternValidate(pat, val) {

	}

	function executeValidation() {
		var failures = [];
		payloadDataPaths.forEach(function payloadDataPathsForEachCb(payloadDataPath) {
			var metaObj = _.where(metaPaths, {path: payloadDataPath})[0];
			if(metaObj && metaObj.meta) {
				var validateObj = objectPath(payload, payloadDataPath);
				if(metaObj.meta.readOnly === true) {
					if(!readOnlyValidate(metaObj.meta.readOnly, validateObj)) {
						failures.push({path: payloadDataPath, failure: 'Value is readonly and may not be set.', value: validateObj});
					}
				}
				if(metaObj.meta.optional === false) {
					if(!optionalValidate(metaObj.meta.optional, validateObj)) {
						failures.push({path: payloadDataPath, failure: 'Value is not optional and must be set.', value: validateObj});
					}
				}
				if(metaObj.meta.minLength && metaObj.meta.maxLength) {
					if(!minMaxLengthValidate(metaObj.meta.minLength, metaObj.meta.maxLength, validateObj)) {
						failures.push({path: payloadDataPath, failure: 'Value is not within acceptable range between ' + metaObj.meta.minLength + ' and ' + metaObj.meta.maxLength, value: validateObj});
					}
				}
				if(metaObj.meta.minItems && metaObj.meta.maxItems) {
					if(!minMaxItemsValidate(metaObj.meta.minItems, metaObj.meta.maxItems, validateObj)) {
						failures.push({path: payloadDataPath, failure: 'Collection size is not within acceptable range between ' + metaObj.meta.minItems + ' and ' + metaObj.meta.maxItems, value: validateObj});
					}
				}
			}
		});
		return failures;
	}

	var results = executeValidation();
	console.log('results', results);
	return results;
}

function get(opts, cb) {
	getMeta(opts.conn, opts.apiInfo, function getMetaCb(err, newMeta) {
		var metaObject = getMetaObject(newMeta);
		console.log(metaObject);
		cb(err, metaObject);
	});
}

module.exports = {
	get: get,
	validate: validate
};
