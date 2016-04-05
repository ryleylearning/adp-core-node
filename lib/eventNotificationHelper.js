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
var pollIncrement = 15000;
var pollDuration = 15000;
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

function deleteMessage() {

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

function queueResponse(err, message) {
	console.log('RESPONSE', err, notification);
	if(message) {
		informListeners(message);
		// pollOnce();
	}
	console.timeEnd('poll');
	
}

function pollOnce() {
	console.time('poll')
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
	request(options, queueResponse);
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

module.exports = {
	addNotificationListener: addNotificationListener,
	removeNotificationListener: removeNotificationListener
};
