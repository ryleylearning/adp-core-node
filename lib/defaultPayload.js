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

var _ = require('lodash');
var jsonSchemaConverter = require('json-schema-compatibility');
var objectPath = require('simple-object-path');

function cleanupSchema(doc){
	Object.keys(doc).forEach(function cb(key){
		if(key === 'id' || key === 'optional' || key === '$schema') {
			delete doc[key];
		}
		if(typeof doc[key] === 'object') {
			cleanupSchema(doc[key]);
		}
	});
}

function schemaToJSON(schema, originalSchema) {
	var type = schema.type || 'object';
	var output;

	if (schema.example) {
		output = 'DELETE_EXAMPLE';
	} else if (_.isUndefined(schema.items) && _.isArray(schema.enum)) {
		output = 'DELETE_ENUM';
	}

	var typeMap = {
		'date-time': 'DELETE_DATETIME',
		date: 'DELETE_DATE',
		string: 'DELETE_STRING',
		integer: 'DELETE_INTEGER',
		long: 'DELETE_LONG',
		float: 'DELETE_FLOAT',
		double: 'DELETE_DOUBLE',
		boolean: 'DELETE_BOOLEAN',
		number: 'DELETE_NUMBER'
	};

	if (_.isUndefined(output)) {
		if (!_.isUndefined(schema.default)) {
			output = 'DELETE_DEFAULT';
		} else if (typeof typeMap[type] !== 'undefined') {
			output = typeMap[type];
		} else if (type === 'object') {
			if(!schema.type && schema.$ref) {
				var rawRefPath = schema.$ref || '';
				rawRefPath = rawRefPath.startsWith('#/') ? rawRefPath.substring(2, rawRefPath.length) : rawRefPath;
				rawRefPath = rawRefPath.startsWith('/') ? rawRefPath.substring(1, rawRefPath.length) : rawRefPath;
				var refPath = rawRefPath;
				var refLocation = objectPath(originalSchema, refPath);
				if(refLocation.type
					&& typeof refLocation.type === 'string'
					&& refLocation.type !== 'object') {
					output = typeMap[refLocation.type];
					// GET OUT if this is a string;
					return output;
				}
				if(refLocation.properties) {
					schema.properties = refLocation.properties;
				}
			}
			output = {};

			_.forEach(schema.properties, function forEachCb(property, name) {
				output[name] = schemaToJSON(property, originalSchema);
			});
		} else if (type === 'array') {
			output = [];

			if (_.isArray(schema.items)) {
				_.forEach(schema.items, function forEachCb(item) {
					output.push(schemaToJSON(item, originalSchema));
				});
			} else if (_.isPlainObject(schema.items)) {
				output.push(schemaToJSON(schema.items, originalSchema));
			} else if (_.isUndefined(schema.items)) {
				output.push({});
			}
		}
	}

	return output;
}
function defaultPayload(schema) {
	var schemaout = jsonSchemaConverter.v4(schema);
	cleanupSchema(schemaout);
	var output = schemaToJSON(schemaout, schemaout);
	return output;
}

/**
@module defaultPayload
@description Build default payload for event.
@param schema {object} schema JSON.
@return output {object} Formatted and cleaned payload with default values.
*/
module.exports = defaultPayload;
