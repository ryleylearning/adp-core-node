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

var consumerApplicationInstance = require('./lib/consumerApplicationInstance');
var apiRequest = require('./lib/apiRequest');
var interpolate = require('./lib/interpolate');
var post = require('./lib/post');
var event = require('./lib/event');
var connectionException = require('./lib/connectionException');
var configurationException = require('./lib/configurationException');
var apiException = require('./lib/apiException');
var configHelper = require('./lib/configHelper');

module.exports = {
	consumerApplicationInstance: consumerApplicationInstance,
	apiRequest: apiRequest,
	interpolate: interpolate,
	post: post,
	connectionException: connectionException,
	configurationException: configurationException,
	apiException: apiException,
	configHelper: configHelper,
	event: event
};
