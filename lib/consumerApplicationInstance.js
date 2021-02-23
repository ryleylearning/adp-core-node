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
var extractRules = require('./extractRules');
var extractAppConfig = require('./configHelper').extractAppConfig;
var objectPath = require('simple-object-path');
var fs = require('fs');
var _ = require('underscore');
/**
@module ConsumerApplicationInstance
*/
function ConsumerApplicationInstance(conn, configPath) {
	var events = [];
	var notificationReadCanonical = '/core/messageCenterManagement/notificationManagement/notificationViewing/notificationEvent.read';
	var notificationDeleteCanonical = '/core/messageCenterManagement/notificationManagement/notificationViewing/notificationEvent.delete';
	var app;

	function createEvent(opts, cb) {
		initEvent(opts, function initEventCb(err, eventInstance) {
			cb(err, eventInstance.getPayload());
		});
	}

	function initEvent(opts, cb) {
		opts.schemaLocation = configPath;
		if(!app) return extractAppConfig(configPath, setConsumerApplication, initEvent.bind(undefined, opts, cb), cb);
		var apiInfo = _.where(app.calls, {methodName: opts.methodName})[0];
		var addon = {
			apiInfo: apiInfo,
			conn: conn
		};
		var eventInstance = event(_.extend(opts, addon));
		eventInstance.init(function initCb(err) {
			events.push({eventId: eventInstance.getEventId(), instance: eventInstance});
			cb(err, eventInstance);
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
		if(!app) return extractAppConfig(configPath, setConsumerApplication, exec.bind(undefined, methodName, opts, cb), cb);
		var apicall = _.where(app.calls, {methodName: methodName})[0];
		if(apicall) {
			var path = interpolate(apicall.path, opts || {});
			var payload = objectPath(opts, 'payload');
			var qs = objectPath(opts, 'qs');
			var headers = objectPath(opts, 'headers') || {};
			var options = {
				requestDesc: app.appName + '.' + methodName,
				httpMethod: apicall.method,
				payload: payload,
				url: conn.connType.apiUrl + path,
				qs: qs,
				headers: _.extend(headers, {
					Authorization: 'Bearer ' + conn.accessToken,
					'If-None-Match': 'None'
        }),
        strictSSL: false,
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

	function getConsumerApplication() {
		return app;
	}

	function setConsumerApplication(a) {
		app = a;
	}

	function getConnection() {
		return conn;
	}

	function getEventRules(opts, cb) {
		initEvent(opts, function initEventCb(err, eventInstance) {
			var rules = extractRules(eventInstance.getValidationRules());
			cb(err, rules);
		});
	}

	function getNextEvent(cb) {
		if(!app) return extractAppConfig(configPath, setConsumerApplication, getNextEvent.bind(undefined, cb), cb);
		var get = _.where(app.calls, {canonicalUri: notificationReadCanonical})[0];
		var del = _.where(app.calls, {canonicalUri: notificationDeleteCanonical})[0];
		get && del && exec(get.methodName, {}, function execGetCb(err, body, headers) {
			err && typeof headers['adp-msg-msgid'] === 'undefined' && cb(err, body, headers);
			typeof headers['adp-msg-msgid'] !== 'undefined' && exec(del.methodName, {'event-id': headers['adp-msg-msgid']}, function execDelCb() {
				cb(err, body, headers);
			});
		});
	}

	function saveEvent(payload, cb) {
		if(!('eventId' in payload)) return cb(new ReferenceError('Event must contain eventId property.'));
		var eventRef = _.where(events, {eventId: payload.eventId})[0];
		if(!eventRef) return cb(new ReferenceError('EventId not found or invalid eventId. EventId must not be altered or deleted from payload.'));
		var eventInstance = eventRef.instance;
		var newPayloadRef = JSON.parse(JSON.stringify(payload));
		eventInstance.setPayload(newPayloadRef);
		eventInstance.buildFinalPayload();
		eventInstance.validate(function validateCb(valerr, validationResults) {
			if(validationResults.length > 0) return cb(validationResults);
			var tmpPayload = eventInstance.getPayload();
			var headers = eventInstance.getHeaders();
			delete tmpPayload.eventId;
			exec(eventInstance.getAPIInfo().methodName, {payload: tmpPayload, headers: headers}, cb);
		});
	}

	return {
		createEvent: createEvent,
		exec: exec,
		getConnection: getConnection,
		getConsumerApplication: getConsumerApplication,
		getData: exec, // Exposing as getData for clearer usage expectations.
		getEventRules: getEventRules,
		getNextEvent: getNextEvent,
		saveEvent: saveEvent
	};

}


module.exports = ConsumerApplicationInstance;
