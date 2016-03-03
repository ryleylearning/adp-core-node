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
var log = require('winston');

/**
@class Event
@description Represents a single event.
*/
function Event(opts) {

	var payload = defaultPayload(opts.apiInfo);

	this.appendData = function appendData(data) {
		var rootObject = this.eventRootObject();
		Object.keys(data).forEach(function keysForEachCb(key) {
			rootObject[key] = data[key];
		});
	};

	this.removeUnusedProperties = function removeUnusedProperties() {
		try{
			var event = payload.events[0];
			delete payload.meta;
			delete payload.confirmMessage;
			delete event.eventID;
			delete event.eventTitle;
			delete event.eventSubTitle;
			delete event.eventReasonCode;
			delete event.eventStatusCode;
			delete event.priorityCode;
			delete event.recordDateTime;
			delete event.creationDateTime;
			delete event.effectiveDateTime;
			delete event.expirationDateTime;
			delete event.dueDateTime;
			delete event.originator;
			delete event.actor;
			delete event.actAsParty;
			delete event.onBehalfOfParty;
			delete event.links;
			delete event.data.output;
			delete event.data.eventContext.contextExpressionID;
			delete event.data.transform.eventReasonCode;
			delete event.data.transform.eventStatusCode;
			delete event.data.transform.effectiveDateTime;
		} catch(e) {
			log.error('Error removing properties from event payload.');
		}
	};

	this.eventRootObject = function eventRootObject() {
		var rootObject;
		try{
			rootObject = payload.events[0].data.transform[opts.rootProperty];
		} catch(e) {
			log.error('Error finding event root object. Root Property: ' + opts.rootProperty);
		}
		return rootObject;
	};

	this.removeUnusedProperties();
}

module.exports = Event;
