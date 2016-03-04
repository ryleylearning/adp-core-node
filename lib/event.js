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

/**
@class Event
@description Represents a single event.
*/
function Event(opts) {

	var payload = deleteUnusedFromEvent(defaultPayload(opts.apiInfo, opts.schemaLocation));
	var payloadRoot = 'events/0/data/';

	this.appendData = function appendData(data) {
		var dataObj = objectPath(payload, payloadRoot + opts.dataPath);
		Object.keys(data).forEach(function keysForEachCb(key) {
			dataObj[key] = data[key];
		});
	};

	this.getPayload = function getPayload() {
		return payload;
	};

}

module.exports = Event;
