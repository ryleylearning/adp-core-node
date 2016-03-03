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
var log = require('winston');

/**
@module defaultPayload
*/
function defaultPayload(apiInfo) {
  var defaultSchemaPath = '../schemas/':
  var schemaName = apiInfo.schemaName;

	try{
		fs.statSync(defaultSchemaPath + schemaName + '.json');
	} catch(e) {
		log.error('Invalid schema location `' + defaultSchemaPath + schemaName + '.json`');
		return {};
	}

	var schema = require(defaultSchemaPath + schemaName + '.json');
	var schemaout = jsonSchemaConverter.v4(schema);
	cleanupSchema(schemaout);
	var output = schemaToJSON(schemaout, {}, {});

	return output;

}

function cleanupSchema(doc){
	Object.keys(doc).forEach(function cb(key){
		if(key === 'id' || key === 'optional' || key === '$schema') {
			delete doc[key];
		}
		if(typeof doc[key] === 'object') {
			cleanupSchemas(doc[key]);
		}
	});
}

function schemaToJSON(schema, models, modelsToIgnore) {
	var type = schema.type || 'object';
	var model;
	var output;

	if (schema.example) {
		output = schema.example;
	} else if (_.isUndefined(schema.items) && _.isArray(schema.enum)) {
		output = schema.enum[0];
	}

	if (_.isUndefined(output)) {
		if (schema.$ref) {
			/*
			model = models[helpers.simpleRef(schema.$ref)];

			if (!_.isUndefined(model)) {
			if (_.isUndefined(modelsToIgnore[model.name])) {
			modelsToIgnore[model.name] = model;
			output = schemaToJSON(model.definition, models, modelsToIgnore);
			delete modelsToIgnore[model.name];
			} else {
			if (model.type === 'array') {
			output = [];
			} else {
			output = {};
			}
			}
			}
			*/
		} else if (!_.isUndefined(schema.default)) {
			output = schema.default;
		} else if (type === 'date-time') {
			output = new Date().toISOString();
		} else if (type === 'date') {
			output = new Date().toISOString().split('T')[0];
		} else if (type === 'string') {
			output = 'string';
		} else if (type === 'integer') {
			output = 0;
		} else if (type === 'long') {
			output = 0;
		} else if (type === 'float') {
			output = 0.0;
		} else if (type === 'double') {
			output = 0.0;
		} else if (type === 'boolean') {
			output = true;
		} else if (type === 'number') {
			output = 0.0;
		} else if (type === 'object') {
			output = {};

			_.forEach(schema.properties, function (property, name) {
				output[name] = schemaToJSON(property, models, modelsToIgnore);
			});
		} else if (type === 'array') {
			output = [];

			if (_.isArray(schema.items)) {
				_.forEach(schema.items, function (item) {
					output.push(schemaToJSON(item, models, modelsToIgnore));
				});
			} else if (_.isPlainObject(schema.items)) {
				output.push(schemaToJSON(schema.items, models, modelsToIgnore));
			} else if (_.isUndefined(schema.items)) {
				output.push({});
			} else {
				console.log('Array type\'s \'items\' property is not an array or an object, cannot process')
			}
		}
	}

	return output;
};
