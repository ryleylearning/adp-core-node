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

var uuid = require('node-uuid');
var _ = require('underscore');
/**
@class EventNotification
@description Class containing the event notification information. Event notifications
can have a 1:M relationship with listeners.
*/
function EventNotification(notificationName) {
	var listeners = [];

	/**
	@memberof EventNotification
	@description Notification name. Typically the operation from the canonical URI.
	*/
	this.notificationName = notificationName;

	/**
	@memberof EventNotification
	@description Unique ID.
	*/
	this.id = uuid.v4();

	/**
	@memberof EventNotification
	@description Append an {@link EventListener}
	@param listener {EventListener} Notification listener
	*/
	this.appendListener = function appendListener(listener) {
		var savedListener = _.where(listeners, {id: listener.id})[0];
		if(!savedListener) {
			listeners.push(listener);
		}
	};

	/**
	@memberof EventNotification
	@description Remove an {@link EventListener}
	@param listener {EventListener} Notification listener
	@returns listenersLength {integer} the number of remaining listeners.
	*/
	this.removeListener = function removeListener(listener) {
		listeners = _.reject(listeners, function rejectCb(item) {
			return item.id === listener.id;
		});
		return listeners.length;
	};

	/**
	@memberof EventNotification
	@description Executes the `notify()` method on each {@link EventListener} in the eventListeners collection.
	@params message {object} JSON
	*/
	this.receiveMessage = function receiveMessage(message) {
		listeners.forEach(function listenersForEachCb(listener) {
			listener.notify(message);
		});
	};
}

module.exports = EventNotification;
