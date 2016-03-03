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

'use stict';

var Event = require('./event');
var _ = require('underscore');
var productMap = require('./tmpMap');

/**
@class APIProductHelper
@description Generic API Product Helper. Manages unsynced events, Event execution.
*/
function APIProductHelper() {

	var events = [];

	this.sync = function sync() {

	};

	this.recordEvent = function recordEvent(productName, methodName, rootProperty, data) {
		var event = _.where(events, {productName: productName, methodName: methodName})[0];
		if(event) {
			event.appendData(data);
		} else {
			var product = _.where(productMap.products, {productName: productName})[0] || {calls: []};
			var apiInfo = _.where(product.calls, {methodName: methodName});
			if(apiInfo) {
				var newEvent = new Event({
					apiInfo: apiInfo,
					rootProperty: rootProperty,
					data: data
				});
				events.push(newEvent);
			}
		}
	};

}

module.exports = APIProductHelper;
