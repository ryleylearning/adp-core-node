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

var adpApiProduct = require('./lib/adpApiProduct');
var apiProductInstance = require('./lib/apiProductInstance');
var apiRequest = require('./lib/apiRequest');
var interpolate = require('./lib/interpolate');
var mapProducts = require('./lib/mapProducts');
var post = require('./lib/post');
var tmpMap = require('./lib/tmpMap');
var connectionException = require('./lib/connectionException');
var configurationException = require('./lib/configurationException');
var apiException = require('./lib/apiException');
var event = require('./lib/event');
var eventNotificationHelper = require('./lib/eventNotificationHelper');
var eventListener = require('./lib/eventListener');

module.exports = {
	adpApiProduct: adpApiProduct,
	apiProductInstance: apiProductInstance,
	apiRequest: apiRequest,
	interpolate: interpolate,
	mapProducts: mapProducts,
	post: post,
	tmpMap: tmpMap,
	connectionException: connectionException,
	configurationException: configurationException,
	apiException: apiException,
	event: event,
	eventListener: eventListener,
	eventNotificationHelper: eventNotificationHelper
};
