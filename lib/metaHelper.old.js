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

var EventException = require('./eventException');
var objectPath = require('simple-object-path');
var request = require('./apiRequest');
var fs = require('fs');
var _ = require('underscore');


function get(conn, apicall, cb) {
	var metaObject;
	var metaLocation = __dirname + '/../meta/';
	var metaFileName = apicall.metaPath.replace(/\//g, '.') + '.json';
	if(metaFileName[0] === '.') metaFileName = metaFileName.substring(1, metaFileName.length);


	function getLocalMeta() {
		try{
			var localMeta = require(metaLocation + metaFileName);
			if(new Date(localMeta.expiration) < new Date()) {
				delete require.cache[require.resolve(metaLocation + metaFileName)];
				localMeta = undefined;
			}
			return localMeta;
		} catch(e) {
			return undefined;
		}
	}

	function saveLocalMeta(meta) {
		var expiration = new Date();
		expiration.setDate(expiration.getDate() + 7);
		var localMeta = {
			expiration: expiration,
			meta: meta
		};
		fs.writeFile(metaLocation + metaFileName, JSON.stringify(localMeta));
	}

	metaObject = getLocalMeta();
	if(!metaObject) {
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
		request(options, function requestCb(err, meta) {
			if(meta) {
				saveLocalMeta(meta);
			}
			cb(err, meta);
		});
	} else {
		cb(null, metaObject.meta);
	}
}

function getMetaObject(meta, payload) {
	var metaRoot = 'events';
	var metaPaths = [];
	var watchedObjects = ['codeList'];
	var watchedProps = ['readOnly', 'optional', 'hidden', 'minItems', 'maxItems', 'minLength', 'maxLength', 'shortLabelName', 'pattern'];

	function pathConformToPayload(metaPath) {
		var props = metaPath.split('/');
		var output = [];
		var data = payload;
		var stubNext = false;
		props.forEach(function propsForEachCb(prop) {
			var outputProp = prop;
			if(stubNext) {
				if(data) data = data[0][prop];
			} else {
				if(data) data = data[prop];
			}
			output.push(outputProp);
			stubNext = false;
			if(typeof data === 'object' && typeof data.forEach === 'function') {
				output.push('__arrayIndex__');
				stubNext = true;
			}
		});
		if(output[output.length - 1] === '__arrayIndex__') {
			output.splice(output.length - 1);
		}
		return output.join('/');
	}

	function cleanPath(pathtoclean) {
		var cleaned = pathtoclean.replace('transforms/0/', 'transform/');
		cleaned = pathConformToPayload(cleaned);
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
				meta: {},
				rulesExecuted: false
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
				if(appendedPath[0] === '/') appendedPath = appendedPath.substring(1, appendedPath.length);
				paths.push(appendedPath);
			} else {
				appendedPath = path + '/' + key;
				if(appendedPath[0] === '/') appendedPath = appendedPath.substring(1, appendedPath.length);
				paths.push(appendedPath);
				if(obj[key]) buildPayloadDataPaths(obj[key], appendedPath);
			}
		});
	}
	buildPayloadDataPaths(data || {}, dataPath);
	return paths;
}

function validate(data, payload, metaObject, dataPath) {
	var payloadDataPaths = [dataPath];
	if(typeof data !== 'string') {
		payloadDataPaths = getPayloadDataPaths(data, dataPath || '');
		payloadDataPaths.push(dataPath);
	}
	// console.log('payloadDataPaths', payloadDataPaths);
	function minMaxLengthValidate(min, max, val) {
		try{
			if(val.length > max || val.length < min) {
				return false;
			}
			return true;
		} catch(e) {
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
			return false;
		}
	}
	/*
	function codeListsValidate(codeList, obj) {
		var codeListMatch = false;
		codeList.listItems.forEach(function itemsForEachCb(item) {
			if(item && Object.keys(item).length > 0) {
				var match = 0;
				Object.keys(item).forEach(function keysForEachCb(key) {
					if(obj && obj[key] && obj[key] === item[key]) {
						match++;
					}
				});
				if(match === Object.keys(item).length) codeListMatch = true;
			}
		});
		return codeListMatch;
	}*/

	/*
	function readOnlyValidate(ro, val) {

	}
	*/
	function patternValidate(pat, val) {
		var regexp = new RegExp(pat);
		return regexp.test(val);
	}

	function executeValidation() {
		var failures = [];
		payloadDataPaths.forEach(function payloadDataPathsForEachCb(payloadDataPath) {
			var metaDataPath = [];
			var payloadProps = payloadDataPath.split('/');
			payloadProps.forEach(function payloadPropsForEachCb(payloadProp) {
				var metaDataProp = payloadProp;
				if(_.isNumber(payloadProp * 1) && !_.isNaN(payloadProp * 1)) metaDataProp = '__arrayIndex__';
				metaDataPath.push(metaDataProp);
			});
			metaDataPath = metaDataPath.join('/');
			var metaObj = _.where(metaObject, {path: metaDataPath})[0];
			if(metaObj && metaObj.meta) {
				metaObj.rulesExecuted = true;
				var validateObj = objectPath(payload, payloadDataPath);
				/*
				if(metaObj.meta.readOnly === true) {
					if(!readOnlyValidate(metaObj.meta.readOnly, validateObj)) {
						failures.push({path: payloadDataPath, message: 'Value is readonly and may not be set.', value: validateObj});
					}
				}*/
				if(metaObj.meta.optional === false) {
					if(!optionalValidate(metaObj.meta.optional, validateObj)) {
						failures.push(new EventException({description: 'Non-optional value', path: payloadDataPath, message: 'Value is not optional and must be set.', value: validateObj}));
					}
				}
				if(metaObj.meta.minLength && metaObj.meta.maxLength) {
					if(!minMaxLengthValidate(metaObj.meta.minLength, metaObj.meta.maxLength, validateObj)) {
						failures.push(new EventException({description: 'Value length', path: payloadDataPath, message: 'Value is not within acceptable range between ' + metaObj.meta.minLength + ' and ' + metaObj.meta.maxLength, value: validateObj}));
					}
				}
				if(_.isNumber(metaObj.meta.minItems) && _.isNumber(metaObj.meta.maxItems)) {
					if(!minMaxItemsValidate(metaObj.meta.minItems, metaObj.meta.maxItems, validateObj)) {
						failures.push(new EventException({description: 'Collection size limit', path: payloadDataPath, message: 'Collection size is not within acceptable range between ' + metaObj.meta.minItems + ' and ' + metaObj.meta.maxItems, value: validateObj}));
					}
				}
				/*
				if(metaObj.meta.codeList && metaObj.meta.codeList.listItems) {
					if(!codeListsValidate(metaObj.meta.codeList, validateObj)) {
						failures.push(new EventException({description: 'List of values must match', path: payloadDataPath, message: 'Collection values did not match list of acceptable values.', value: validateObj}));
					}
				}*/
				if(metaObj.meta.pattern && metaObj.meta.pattern.length > 0) {
					if(!patternValidate(metaObj.meta.pattern, validateObj)) {
						failures.push(new EventException({description: 'Pattern match failure', path: payloadDataPath, message: 'Value must match acceptable pattern.', value: validateObj}));
					}
				}
			}
		});
		return failures;
	}

	var results = executeValidation();
	return results;
}

function getMeta(opts, cb) {
	get(opts.conn, opts.apiInfo, function getMetaCb(err, newMeta) {
		var metaObject;
		if(!err && newMeta && newMeta.meta) {
			metaObject = getMetaObject(newMeta, opts.payload);
		}
		cb(err, metaObject);
	});
}

/**
@module metaHelper
*/
module.exports = {

	/**
	@function
	@description Get meta validation object.
	@param opts {object} Object containing a connection instance, api Product info, full payload of related event.
	@param callback {function} callback to be executed once meta has been received and formatted for validations.
	*/
	getMeta: getMeta,

	/**
	@function
	@description This validation works based on path comparison. Meta serves `paths` to the various validated entities.
	We emulate the path pattern with the object being validated. ObjectPath is the utility used to navigate to a specific
	area of an object based on these same paths. Validation is performed by constructing `payloadDataPaths` based on
	a combination of the `dataPath` param and the `data` param. We recursively loop through Object.keys to find all properties
	and translate that into a path. Each possible path to each property is recored in the array as a new element. In the case of a
	full payload validation we have no `dataPath` param which creates an array of payloadDataPaths for the entire payload.
	Consequently when `dataPath` is empty, `data === payload`.

	Once the paths are built, we iterate them and attempt to match with a `metaObject[n].path` property. Before attempting to
	match this property, we split the payloadDataPath array element and inspect each property in the path. A replacement is done
	of any numeric properties which would represent array elements to our placeholder for indexes (`0` to `__arrayIndex__`). This
	is done because `metaObject` does not speak about individual elements in an array. Rather it must speak generically about
	any element in a collection so this placeholder is used in meta for this purpose.

	Once a path match is found, we analyze the meta rules and perform validations. A collection of ValidationExceptions are returned
	once the validation is complete.

	@param data {object} Data may be a subset of the payload or the full payload. The purpose of this parameter is to
	build a set of paths within the payload to validate. This is this parameters only purpose in life. Since it is
	a SUBSET of the payload, we cannot use the paths to navigate to a position within this object. The entire object
	must exist if we are to navigate based on a path. The path must be complete to compare with meta.

	@param payload {object} The full payload. This parameter is present to allow us to navigate to the validated path
	expressed in meta.

	@param metaObject {object} Organized meta object with paths and validation rules.

	@param dataPath {string} This parameter may be a path to a specific location in the payload or EMPTY STRING which
	would represent a full payload valiation

	@return results {array} List of {@link EventException}
	*/
	validate: validate
};
