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
var event = require('./event');
var interpolate = require('./interpolate');
var fs = require('fs');
var _ = require('underscore');

/**
@module ConsumerApplicationInstance
*/
function ConsumerApplicationInstance(conn, app) {
	var events = [];

	function getConsumerApplication() {
		return app;
	}

	function getConnection() {
		return conn;
	}
	/*
	function getEventNotifications() {
		var notifications = [];
		if(!app.notificationCanonicals || typeof app.notificationCanonicals.forEach !== 'function') return notifications;
		app.notificationCanonicals.forEach(function notificationsForEachCb(notification) {
			var notificationName = notification.substring(notification.lastIndexOf('/') + 1, notification.length);
			notifications.push(notificationName);
		});
		return notifications;
	}
	*/
	function createEvent(opts, cb) {
		var apiInfo = _.where(app.calls, {methodName: opts.methodName})[0];
		var addon = {
			apiInfo: apiInfo,
			conn: conn
		};
		var eventInstance = event(_.extend(opts, addon));
		eventInstance.init(function initCb(err) {
			events.push({eventId: eventInstance.getEventId(), instance: eventInstance});
			cb(err, eventInstance.getPayload());
		});
	}

	function saveEvent(payload, cb) {
		if(!('eventId' in payload)) return cb(new ReferenceError('Event must contain eventId property.'));
		var eventRef = _.where(events, {eventId: payload.eventId})[0];
		if(!eventRef) return cb(new ReferenceError('EventId not found or invalid eventId. EventId must not be altered or deleted from payload.'));
		var eventInstance = eventRef.instance;
		eventInstance.setPayload(payload);
		eventInstance.buildFinalPayload();
		eventInstance.validate(function validateCb(valerr, validationResults) {
			if(validationResults.length > 0) return cb(validationResults);
			var tmpPayload = eventInstance.getPayload();
			delete tmpPayload.eventId;
			eventInstance.setPayload(tmpPayload);
			exec(eventInstance.getAPIInfo().methodName, {payload: eventInstance.getPayload()}, cb);
		});
	}

	/**
	@memberof ConsumerApplicationInstance
	@description Abstracted method to call available `methods` API Products mapped in the instances of {@link APIProduct}.
	@param methodName {string} Method name. See example below.
	@param cb {function} Function to execute upon response from method call.
	@example ConsumerApplicationInstance.exec('read', callbackFunction);
	*/
	function exec(methodName, opts, cb) {
		var apicall = _.where(app.calls, {methodName: methodName})[0];
		if(apicall) {
			var path = interpolate(apicall.path, opts);
			var options = {
				requestDesc: app.appName + '.' + methodName,
				httpMethod: apicall.method,
				payload: opts.payload,
				url: conn.connType.apiUrl + path,
				headers: {
					Authorization: 'Bearer ' + conn.accessToken,
					'If-None-Match': 'None'
				},
				agentOptions: {
					ca: [fs.readFileSync(conn.connType.sslCertPath)],
					key: fs.readFileSync(conn.connType.sslKeyPath),
					cert: fs.readFileSync(conn.connType.sslCertPath)
				}
			};
			request(options, cb);
		} else {
			cb(new ReferenceError('Invalid method name. Failed to find method `' + methodName + '`'), null);
		}
	}

	return {
		createEvent: createEvent,
		exec: exec,
		getConnection: getConnection,
		getConsumerApplication: getConsumerApplication,
		// getEventNotifications: getEventNotifications,
		saveEvent: saveEvent
	};

}


module.exports = ConsumerApplicationInstance;
