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

var Request = require('./apiRequest');
var fs = require('fs');
var interpolate = require('./interpolate');
var EventNotification = require('./eventNotification');
var _ = require('underscore');

/**
@class APIProductInstance
*/
function APIProductInstance(conn, product) {

	this.getAPIProduct = function getAPIProduct() {
		return product;
	};

	this.getConnection = function getConnection() {
		return conn;
	};

	this.getEventNotifications = function getEventNotifications() {
		var notifications = [];
		if(!product.notificationCanonicals || typeof product.notificationCanonicals.forEach !== 'function') return notifications;
		product.notificationCanonicals.forEach(function notificationsForEachCb(notification) {
			var notificationName = notification.substring(notification.lastIndexOf('/') + 1, notification.length);
			notifications.push(notificationName);
		});
		return notifications;
	};

	/**
	@memberof APIProductInstance
	@description Abstracted method to call available `methods` API Products mapped in the instances of {@link APIProduct}.
	@param methodName {string} Method name. See example below.
	@param cb {function} Function to execute upon response from method call.
	@example APIProductInstance.call('read', callbackFunction);
	*/
	this.exec = function exec(methodName, opts, cb) {
		var apicall = _.where(product.calls, {methodName: methodName})[0];
		if(apicall) {
			var path = interpolate(apicall.path, opts);
			var options = {
				requestDesc: product.productName + '.' + methodName,
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
			new Request(options, cb);
		} else {
			cb(new ReferenceError('Invalid method name. Failed to find method `' + methodName + '`'), null);
		}
	};

}


module.exports = APIProductInstance;
