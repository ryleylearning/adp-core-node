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
var fs = require('fs');

var eventNotifications = [];
var activelyListening = false;
var conn;

function addNotificationListener(connection, notificationName, listener) {
	conn = connection;
	var savedEvent = _.where(eventNotifications, {notificationName: notificationName})[0];
	if(!savedEvent) {
		savedEvent = new EventNotification(notificationName);
		eventNotifications.push(savedEvent);
	}
	savedEvent.appendListener(listener);
	if(!activelyListening) listen();
}

function deleteMessage(message, headers) {
	var messageId = headers['adp-msg-msgid'];
	var options = {
		requestDesc: 'DELETE.EventNotificationMessage',
		httpMethod: 'DELETE',
		url: conn.connType.apiUrl + '/core/v1/event-notification-messages/' + messageId,
		headers: {
			Authorization: 'Bearer ' + conn.accessToken
		},
		agentOptions: {
			ca: [fs.readFileSync(conn.connType.sslCertPath)],
			key: fs.readFileSync(conn.connType.sslKeyPath),
			cert: fs.readFileSync(conn.connType.sslCertPath)
		}
	};
	request(options, deleteResponse);
}

function deleteResponse(err) {
	if(err) stopListening();
	pollOnce();
}

function informListeners(message) {
	eventNotifications.forEach(function eventNotificationsForEach(eventNotification) {
		eventNotification.receiveMessage(message);
	});
}

function listen() {
	activelyListening = true;
	pollOnce();
}

function messageResponse(err, message, headers) {
	console.timeEnd('poll');
	if(message) {
		informListeners(message);
		deleteMessage(message, headers);
	} else {
		pollOnce();
	}
}

function pollOnce() {
	console.time('poll');
	if(!activelyListening) return;
	var options = {
		requestDesc: 'LONGPOLL.EventNotificationMessages',
		httpMethod: 'GET',
		url: conn.connType.apiUrl + '/core/v1/event-notification-messages',
		headers: {
			Authorization: 'Bearer ' + conn.accessToken,
			Prefer: '/adp/long-polling'
		},
		agentOptions: {
			ca: [fs.readFileSync(conn.connType.sslCertPath)],
			key: fs.readFileSync(conn.connType.sslKeyPath),
			cert: fs.readFileSync(conn.connType.sslCertPath)
		}
	};
	request(options, messageResponse);
}
function removeNotificationListener(notificationName, listener) {
	var savedEvent = _.where(eventNotifications, {notificationName: notificationName})[0];
	if(savedEvent) {
		var remaining = savedEvent.removeListener(listener);
		if(remaining === 0) {
			eventNotifications = _.reject(eventNotifications, function rejectCb(item) {
				return item.notificationName === notificationName;
			});
		}
	}
	if(eventNotifications.length === 0) stopListening();
}

function stopListening() {
	activelyListening = false;
}

/**
@module eventNotificationHelper
@exports addNotificationListener
*/
module.exports = {
	/**
	@function
	@description Adds an event notification listener. If the event notification does not exist
	an eventNotification is added to the eventNotifications array. Once an event
	notification and listener have been added, this module will begin polling
	for notifications. The polling will continue until a message is received.
	Once a message is received, the message is broadcast to *all* notification
	listeners. When the messgage has been broadcast the polling will continue.
	The message is then deleted from the message queue.
	@param notificationName {string} {@link EventNotificaiton} name.
	@param listener {EventListener} Notification listener.
	*/
	addNotificationListener: addNotificationListener,

	/**
	@function
	@description Removes an event notification listener. If the last event listener is
	removed, the event notification will be removed from the collection. If the
	final eventNotification is removed from the eventNotifications collection
	the polling will immediately stop.
	@param notificationName {string} {@link EventNotificaiton} name.
	@param listener {EventListener} Notification listener.
	*/
	removeNotificationListener: removeNotificationListener
};
