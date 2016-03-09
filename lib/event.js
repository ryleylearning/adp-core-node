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

var defaultPayload = require('./defaultPayload');
var deleteUnusedFromEvent = require('./deleteUnusedFromEvent');
var objectPath = require('./objectPath');
var log = require('winston');
var metaHelper = require('./metaHelper');

/**
@class Event
@description Represents a single event.
*/
function Event(opts) {

	var payload;
	var schema;
	var meta;

	this.retrieveMeta = function retrieveMeta(cb) {
		metaHelper.get({conn: opts.conn, apiInfo: opts.apiInfo, dataPath: opts.dataPath}, function metaHelperCb(err, metaObj) {
			if(metaObj) {
				meta = metaObj;
			}
			cb(err);
		});
	};

	this.retrieveSchema = function retrieveSchema(cb) {
		schema = require(opts.schemaLocation + opts.apiInfo.schemaName + '.json');
		cb();
	};

	this.buildPayload = function buildPayload(cb) {
		// go get schema.
		// go get meta.
		payload = deleteUnusedFromEvent(defaultPayload(schema));
		cb();
	};

	this.appendData = function appendData(data) {
		var dataObj = objectPath(payload, opts.dataPath);
		Object.keys(data).forEach(function keysForEachCb(key) {
			if(dataObj[key]) dataObj[key] = data[key];
		});
	};

	this.getPayload = function getPayload() {
		return payload;
	};

	this.getApiInfo = function getApiInfo() {
		return opts.apiInfo;
	};

}

module.exports = Event;
