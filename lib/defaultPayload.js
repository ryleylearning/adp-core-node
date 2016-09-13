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

function schemaToJSON(schema) {
	var type = schema.type || 'object';
	var output;

	if (schema.example) {
		output = 'DELETE_EXAMPLE';
	} else if (_.isUndefined(schema.items) && _.isArray(schema.enum)) {
		output = 'DELETE_ENUM';
	}

	if (_.isUndefined(output)) {
		if (!_.isUndefined(schema.default)) {
			output = 'DELETE_DEFAULT';
		} else if (type === 'date-time') {
			output = 'DELETE_DATETIME';
		} else if (type === 'date') {
			output = 'DELETE_DATE';
		} else if (type === 'string') {
			output = 'DELETE_STRING';
		} else if (type === 'integer') {
			output = 'DELETE_INTEGER';
		} else if (type === 'long') {
			output = 'DELETE_LONG';
		} else if (type === 'float') {
			output = 'DELETE_FLOAT';
		} else if (type === 'double') {
			output = 'DELETE_DOUBLE';
		} else if (type === 'boolean') {
			output = 'DELETE_BOOLEAN';
		} else if (type === 'number') {
			output = 'DELETE_NUMBER';
		} else if (type === 'object') {
			output = {};

			_.forEach(schema.properties, function forEachCb(property, name) {
				output[name] = schemaToJSON(property);
			});
		} else if (type === 'array') {
			output = [];

			if (_.isArray(schema.items)) {
				_.forEach(schema.items, function forEachCb(item) {
					output.push(schemaToJSON(item));
				});
			} else if (_.isPlainObject(schema.items)) {
				output.push(schemaToJSON(schema.items));
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
	var output = schemaToJSON(schemaout);
	return output;
}

/**
@module defaultPayload
@description Build default payload for event.
@param schema {object} schema JSON.
@return output {object} Formatted and cleaned payload with default values.
*/
module.exports = defaultPayload;
