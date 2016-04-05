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

var request = require('./apiRequest');
var EventNotification = require('./eventNotification');
var _ = require('underscore');

var eventNotifications = [];
var activelyListening = false;
var pollIncrement = 15000;
var pollDuration = 15000;

function addNotificationListener(notificationName, listener) {
	var savedEvent = _.where(eventNotifications, {notificationName: notificationName})[0];
	if(!savedEvent) {
		savedEvent = new EventNotification(notificationName);
		eventNotifications.push(savedEvent);
	}
	savedEvent.appendListener(listener);
}

function deleteMessage() {

}

function informListeners() {

}

function listen() {
	activelyListening = true;
	pollOnce();
}

function queueResponse() {
	if(err) {
		pollOnce();
	}
	
}

function pollOnce() {
	if(!activelyListening) return;
	var headers = {
		Prefer: 'adp/long-poll'
	}
	// a single HTTP long poll. 
	// request and return only.
}

function removeNotificationListener(notificationName, listener) {
	var savedEvent = _.where(eventNotifications, {notificationName: notificationName})[0];
	if(savedEvent) {
		console.log('found event listener to remove.')
		var remaining = savedEvent.removeListener(listener);
		if(remaining === 0) {
			eventNotifications = _.reject(eventNotifications, function rejectCb(item) {
				return item.notificationName === notificationName;
			});
			console.log('that was the last one', eventNotifications.length);
		}
	}
}

function stopListening() {
	activelyListening = false;
}

module.exports = {
	addNotificationListener: addNotificationListener,
	removeNotificationListener: removeNotificationListener
};
