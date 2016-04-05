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

var EventListener = require('./eventListener');
var uuid = require('node-uuid');
var _ = require('underscore');

function EventNotification(notificationName) {
	var listeners = [];

	this.notificationName = notificationName;
	this.id = uuid.v4();

	this.appendListener = function appendListener(listener) {
		var savedListener = _.where(listeners, {id: listener.id})[0];
		if(!savedListener) {
			listeners.push(listener);
		}
	};

	this.removeListener = function removeListener(listener) {
		listeners = _.reject(listeners, function rejectCb(item) {
			return item.id === listener.id;
		});
	};
}

module.exports = EventNotification;
