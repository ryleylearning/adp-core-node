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

var Event = require('./event');
var _ = require('underscore');

/**
@class APIProductHelper
@description Generic API Product Helper. Manages unsynced events, Event execution.
*/
function APIProductHelper() {

	var events = [];

	this.sync = function sync() {
		console.log(JSON.stringify(events[0].getPayload()));
	};

	this.recordEvent = function recordEvent(apiProductInstance, methodName, rootProperty, data) {
		var apiProduct = apiProductInstance.getAPIProduct();
		var event = _.where(events, {productName: apiProduct.productName, methodName: methodName})[0];
		if(event) {
			event.eventInstance.appendData(data);
		} else {
			var apiInfo = _.where(apiProduct.calls, {methodName: methodName})[0];
			if(apiInfo) {
				var newEvent = new Event({
					apiInfo: apiInfo,
					rootProperty: rootProperty
				});
				newEvent.appendData(data);
				events.push({
					productName: apiProduct.productName,
					methodName: methodName,
					apiProductInstance: apiProductInstance,
					eventInstance: newEvent
				});
			}
		}
	};

}

module.exports = APIProductHelper;
