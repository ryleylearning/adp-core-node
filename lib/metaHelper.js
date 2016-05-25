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

var ValidationException = require('./validationException');
var objectPath = require('simple-object-path');
var request = require('./apiRequest');
var async = require('async');
var fs = require('fs');
var _ = require('underscore');

function getHttpMeta(conn, path, desc, cb) {
	var options = {
		requestDesc: 'Meta.' + desc,
		httpMethod: 'GET',
		url: conn.connType.apiUrl + path,
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


function get(conn, apicall, payload, cb) {
	var metaObject;
	var rawMeta;
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

	function extractRefs(meta, hrefs) {
		if(!meta) return;
		var outputHrefs = hrefs || [];
		var lookFor = ['codeList'];
		Object.keys(meta).forEach(function keysForEachCb(key) {
			if(~lookFor.indexOf(key)) {
				if(meta[key] && meta[key].links && !meta[key].listItems) {
					meta[key].listItems = [];
					meta[key].links.forEach(function linksForEachCb(link) {
						if(link.href && ~link.href.indexOf('{#')) {
							var path = link.href.substring(link.href.indexOf('{#') + 2, link.href.indexOf('}'));
							link.variablePath = path;
						}
						if(link.href && !link.variablePath) {
							outputHrefs.push({
								href: link.href,
								subset: meta[key]
							});
						}
					});
				}
			} else {
				if(meta[key] && typeof meta[key] === 'object') extractRefs(meta[key], outputHrefs);
			}
		});
		return outputHrefs;
		// saveLocalMeta(meta);
	}

	function getMetaSubset(ref, asyncCb) {
		getHttpMeta(conn, ref.href, 'Embedded.CodeList' + ref.href, function getHttpMetaCb(err, subsetmeta) {
			var listItems = ref.subset.listItems;
			var newListItems;
			if(subsetmeta && subsetmeta.listItems) {
				newListItems = listItems.concat(subsetmeta.listItems);
			}
			ref.subset.listItems = newListItems;
			asyncCb(null);
		});
	}

	function appendSubsets(err) {
		metaObject = getMetaObject(rawMeta, payload);
		saveLocalMeta(metaObject);
		cb(err, metaObject);
	}

	metaObject = getLocalMeta();
	if(!metaObject) {
		getHttpMeta(conn, apicall.metaPath, apicall.methodName, function getHttpMetaCb(err, meta) {
			rawMeta = meta;
			if(rawMeta) {
				var hrefs = extractRefs(rawMeta);
				async.each(hrefs, getMetaSubset, appendSubsets);
			}

		});
	} else {
		cb(null, metaObject.meta);
	}
}

function getMetaObject(meta, payload) {
	var metaRoot = 'events';
	var metaPaths = [];
	var watchedObjects = ['codeList', 'dependencies'];
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
		cleaned = pathtoclean.replace('transforms/0', 'transform');
		cleaned = pathConformToPayload(cleaned);
		return cleaned;
	}

	function cleanPathReferences(path, key, obj) {
		if(key === 'codeList') {
			cleanCodeListPathReferences(path, obj);
		} else if(key === 'dependencies') {
			cleanDependenciesPathReferences(path, obj);
		}
	}

	function cleanCodeListPathReferences(path, obj) {
		if(obj && obj.links) {
			obj.links.forEach(function linksForEachCb(link) {
				if(link.href.indexOf('{')) {
					var partialPath = link.href.substring(link.href.indexOf('{#') + 2, link.href.indexOf('}'));
					var fullPath = path + partialPath;
					link.href = link.href.replace(partialPath, fullPath);
					link.variablePath = fullPath;
				}
			});
		}
	}

	function cleanDependenciesPathReferences(path, obj) {
		Object.keys(obj).forEach(function keysForEachCb(key) {
			if(obj[key] && typeof obj[key] === 'object') {
				if(key === 'attributes') {
					var attrs = obj[key];
					attrs.metaObj = [];
					Object.keys(attrs).forEach(function attrKeysForEachCb(attrKey) {
						if(attrKey === 'metaObj') return;
						var newAttrKey = path + attrKey;
						attrs[newAttrKey] = attrs[attrKey];
						attrs.metaObj.push({
							path: newAttrKey,
							meta: attrs[attrKey]
						});
						delete attrs[attrKey];
						if(attrs[newAttrKey] && attrs[newAttrKey].codeList) {
							cleanCodeListPathReferences(path, attrs[newAttrKey].codeList);
						}
						delete attrs[newAttrKey];
					});
				} else {
					cleanDependenciesPathReferences(path, obj[key]);
				}
			}
		});
	}

	function addToMetaPathArray(path, key, obj, lastPath) {
		var cleanedPath = cleanPath(path);
		if(~watchedObjects.indexOf(key)) {
			cleanPathReferences(cleanPath(lastPath), key, obj);
		}
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

	var lastAppendedPath = '';
	function buildMetaPaths(obj, paths) {

		Object.keys(obj).forEach(function keysForEach(key) {
			var appendedPath = '';
			if(~key.indexOf('/')) {
				appendedPath = paths + key;
				lastAppendedPath = paths;
				if(obj[key]) buildMetaPaths(obj[key], appendedPath);
			} else if(typeof obj[key] !== 'object') {
				if(~watchedProps.indexOf(key)) {
					addToMetaPathArray(paths, key, obj);
				}
			} else {
				if(~watchedObjects.indexOf(key)) {
					addToMetaPathArray(paths, key, obj, lastAppendedPath);
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

function getPayloadDataPaths(data) {
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
	buildPayloadDataPaths(data, '');
	return paths;
}

function validate(conn, payload, metaObject, cb) {
	var results = [];
	var asyncValidations = [];
	var asyncValidationResults = [];

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

	function codeListsValidate(codeList, obj, path) {
		var codeListMatch = false;
		var val;
		if(typeof obj === 'string') {
			val = obj;
		}
		if(obj && obj.codeValue) {
			val = obj.codeValue;
		}
		var result = _.where(codeList.listItems, {codeValue: val})[0];
		if(result) {
			codeListMatch = true;
		}
		if(codeList.listItems.length === 0 && codeList.links) {
			codeListMatch = true; // this allows the *sync* validation to pass.
			asyncValidations.push({codeList: codeList,  data: obj, path: path});
		}
		return codeListMatch;
	}

	/*
	function readOnlyValidate(ro, val) {

	}
	*/

	function patternValidate(pat, val) {
		var regexp = new RegExp(pat);
		return regexp.test(val);
	}

	/**
		Validates dependencies.
		This is somewhat of a duplication of the logic in `runValidations` but necessary
		given the different structure of `dependencies` when compared with upper-level
		meta rules.
		- Currently only supports pattern validation.
		- Different from other "Validate" functions (above):
			** passes back it's own list of failures (depfailures) whereas other validation functions return boolean
			** not really a validation function in itself.
			** finds all validiations and passes the "metaObj" to `parseForValidation` which runs the actual validations.
			** always passes the full payload for validation to `parseForValidation` because the dependencies
			need to evaluate across the whole payload.
	*/
	function dependenciesValidate(dep, val) {
		var depfailures = [];
		if(dep && dep.pattern && dep.pattern.oneOf) {
			var pats = dep.pattern.oneOf;
			pats.forEach(function patsForEachCb(pat) {
				if(patternValidate(pat.value, val)) {
					depfailures = depfailures.concat(parseForValidation(payload, pat.attributes.metaObj));
				}
			});
		}
		return depfailures;
	}

	/**
		Executes any validations which require async/HTTP calls.
		- Currently only supports codeLists
		**
		Param `variablePath` is a property which describes an argument needed for an HTTP call.
		example:
		`/codelists/hr/v3/worker-management/statenamevalues?country={#events/__arrayIndex__/data/transform/worker/person/legalAddress/countryCode}`
		- When dealing with a `variablePath` we must assume any __arrayIndex__ references resolve to `0`
			as it is not reasonable to find all potential (any array index) values and attempt the async/HTTP
			operation on the multiple values. Thus this value is assumed to be the first instance of the value (index zero).
	*/
	function asyncCodeListValidation(listInfo, asyncCb) {
		var href = objectPath(listInfo, 'codeList/links/0/href');
		var variablePath = objectPath(listInfo, 'codeList/links/0/variablePath');
		var tmpVariablePath = variablePath.replace(/__arrayIndex__/g, '0');
		var variableValue = objectPath(payload, tmpVariablePath);
		href = href.replace('{#', '');
		href = href.replace('}', '');
		href = href.replace(variablePath, variableValue);
		getHttpMeta(conn, href, 'AsyncValidation.' + href, function getHttpMetaCb(err, asyncCodeList) {
			if(asyncCodeList) {
				if(!codeListsValidate(asyncCodeList, listInfo.data)) {
					var validationResult = new ValidationException({description: 'Async List of values must match', path: listInfo.path, message: 'Collection values did not match list of acceptable values.', value: listInfo.data});
					asyncValidationResults.push(validationResult);
				}
			}
			asyncCb();
		});
	}

	/**
		Final callback for async Validations.
		- async.each.asyncCodeListValidation populates asyncValidationResults array.
		- appends asyncValidationResults to global results array.
		- executes validation callback
	*/
	function appendResults() {
		results = results.concat(asyncValidationResults);
		cb(null, results);
	}

	/**
		Executes validations for a single `payloadDataPath`.
		- Called from a loop in `parseForValidation`
		- metaObj is a set of properties that describes the validations for this `payloadDataPath` alone.
		- validateObj is the object/string being evaluated against the rules.
		- payloadDataPath is the path to the validateObj within the payload.
	*/
	function runValidations(metaObj, validateObj, payloadDataPath) {
		var failures = [];
		metaObj.rulesExecuted = true;
		/*
		if(metaObj.meta.readOnly === true) {
			if(!readOnlyValidate(metaObj.meta.readOnly, validateObj)) {
				failures.push({path: payloadDataPath, message: 'Value is readonly and may not be set.', value: validateObj});
			}
		}*/
		if(metaObj.meta.optional === false) {
			if(!optionalValidate(metaObj.meta.optional, validateObj)) {
				failures.push(new ValidationException({description: 'Non-optional value', path: payloadDataPath, message: 'Value is not optional and must be set.', value: validateObj}));
			}
		}
		if(metaObj.meta.minLength || metaObj.meta.maxLength) {
			metaObj.meta.minLength = metaObj.meta.minLength || 0;
			metaObj.meta.maxLength = metaObj.meta.maxLength || 0;
			if(!minMaxLengthValidate(metaObj.meta.minLength, metaObj.meta.maxLength, validateObj)) {
				failures.push(new ValidationException({description: 'Value length', path: payloadDataPath, message: 'Value is not within acceptable range between ' + metaObj.meta.minLength + ' and ' + metaObj.meta.maxLength, value: validateObj}));
			}
		}
		if(_.isNumber(metaObj.meta.minItems) && _.isNumber(metaObj.meta.maxItems)) {
			if(!minMaxItemsValidate(metaObj.meta.minItems, metaObj.meta.maxItems, validateObj)) {
				failures.push(new ValidationException({description: 'Collection size limit', path: payloadDataPath, message: 'Collection size is not within acceptable range between ' + metaObj.meta.minItems + ' and ' + metaObj.meta.maxItems, value: validateObj}));
			}
		}
		if(metaObj.meta.codeList && metaObj.meta.codeList.listItems) {
			if(!codeListsValidate(metaObj.meta.codeList, validateObj, payloadDataPath)) {
				failures.push(new ValidationException({description: 'List of values must match', path: payloadDataPath, message: 'Collection values did not match list of acceptable values.', value: validateObj}));
			}
		}
		if(metaObj.meta.dependencies) {
			failures = failures.concat(dependenciesValidate(metaObj.meta.dependencies, validateObj));
		}
		if(metaObj.meta.pattern && metaObj.meta.pattern.length > 0) {
			if(!patternValidate(metaObj.meta.pattern, validateObj)) {
				failures.push(new ValidationException({description: 'Pattern match failure', path: payloadDataPath, message: 'Value must match acceptable pattern.', value: validateObj}));
			}
		}
		return failures;
	}

	/**
		Parses the `validationMeta` parameter and performs the validations described therein.
		**
		- Called for inital validations as well as dependencies.
		- Not recursively called, but could end up being called in a chain if dependencies are nested.
		- validationData is either the subset of data being validated or the entire payload (described in detail in .validate documentation).
		- returns array of all failures based on validations passed in.
	*/
	function parseForValidation(validationData, validationMeta) {
		var allfailures = [];
		var payloadDataPaths = getPayloadDataPaths(validationData);
		payloadDataPaths.forEach(function payloadDataPathsForEachCb(payloadDataPath) {
			var metaDataPath = [];
			var payloadProps = payloadDataPath.split('/');
			payloadProps.forEach(function payloadPropsForEachCb(payloadProp) {
				var metaDataProp = payloadProp;
				if(_.isNumber(payloadProp * 1) && !_.isNaN(payloadProp * 1)) metaDataProp = '__arrayIndex__';
				metaDataPath.push(metaDataProp);
			});
			metaDataPath = metaDataPath.join('/');
			var metaObj = _.where(validationMeta, {path: metaDataPath})[0];
			if(metaObj && metaObj.meta) {
				var validateObj = objectPath(payload, payloadDataPath);
				allfailures = allfailures.concat(runValidations(metaObj, validateObj, payloadDataPath));
			}
		});

		return allfailures;
	}

	/* append sync validation results */
	results = results.concat(parseForValidation(payload, metaObject));

	/* only run async validations if cb function is present */
	if(typeof cb === 'function') {
		/* execute async validations */
		async.each(asyncValidations, asyncCodeListValidation, appendResults);
	} else {
		return results;
	}
}

function getMeta(opts, cb) {
	get(opts.conn, opts.apiInfo, opts.payload, cb);
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

	@return results {array} List of {@link ValidationException}
	*/
	validate: validate
};
