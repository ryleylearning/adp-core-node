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

var log = require('winston');
var Event = require('./event');
var metaValidator = require('./metaValidator');
var async = require('async');
var _ = require('underscore');

/**
@class APIProductHelper
@description Generic API Product Helper. Manages unsynced events, Event execution.
*/
function APIProductHelper(schemaLocation) {

	var events = [];

	this.sync = function sync(cb) {
		this.cb = cb;
		async.each(events, this.executeEvent.bind(this), this.syncFinish.bind(this));
	};

	this.syncFinish = function syncFinish(err) {
		log.info('Sync complete.');
		var results = {};
		var errs = _.pluck(events, 'err');
		results.errorCount = errs.length;
		if(errs.length > 0) {
			results.errors = errs;
		}
		if(typeof this.cb === 'function') {
			this.cb(results);
			delete this.cb;
		}
	};

	this.executeEvent = function executeEvent(eventInfo, cb) {
		var apiProductInstance = eventInfo.apiProductInstance;
		apiProductInstance.call(eventInfo.methodName, {payload: eventInfo.eventInstance.getPayload()}, function callCb(err, data) {
			var deleteIndex;
			if(!err) {
				events.forEach(function eventsForEachCb(event, idx) {
					if(event.productName === eventInfo.productName && event.methodName === eventInfo.methodName) {
						deleteIndex = idx;
					}
				}.bind(this));
				if(deleteIndex) events.splice(deleteIndex); 
			} else {
				eventInfo.err = err;
			}
			cb(null, data);
		}.bind(this));
	};

	this.recordEvent = function recordEvent(apiProductInstance, methodName, dataPath, data) {
		var apiProduct = apiProductInstance.getAPIProduct();
		var event = _.where(events, {productName: apiProduct.productName, methodName: methodName, dataPath: dataPath})[0];
		var eventInstance;
		if(event) {
			eventInstance = event.eventInstance;
		} else {
			var apiInfo = _.where(apiProduct.calls, {methodName: methodName})[0];
			if(apiInfo) {
				eventInstance = new Event({
					apiInfo: apiInfo,
					schemaLocation: schemaLocation,
					dataPath: dataPath
				});
				events.push({
					productName: apiProduct.productName,
					methodName: methodName,
					dataPath: dataPath,
					apiProductInstance: apiProductInstance,
					eventInstance: eventInstance
				});
			}
		}
		eventInstance.appendData(data);
		var opts = {
			conn: apiProductInstance.getConnection(), 
			apiInfo: eventInstance.getApiInfo(), 
			dataPath: dataPath, 
			data: eventInstance.getPayload()
		};
		metaValidator.validate(opts, function validateCb() {

		});
	};

}

module.exports = APIProductHelper;
