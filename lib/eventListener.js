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

/**
@class EventListener
@description Observer for receiving event notification messages.
*/
function EventListener() {
	var callback;

	/**
	@memberof EventNotification
	@description Unique ID.
	*/
	this.id = uuid.v4();

	/**
	@memberof EventListener
	@description Interface expected for all event listeners. This method is called when an 
	event notification message is received. Executes callback set with `EventListener.setCallback()`
	@param message {object} JSON
	*/
	this.notify = function notify(message) {
		callback(message);
	};

	/**
	@memberof EventListener
	@description Sets callback function to be executed by `EventListener.notify()`.
	@param callback {function} Callback function
	*/
	this.setCallback = function setCallback(cb) {
		callback = cb;
	};
}

module.exports = EventListener;
