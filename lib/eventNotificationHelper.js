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
var _ = require('underscore');

var eventNotifications = [];
var activelyListening = false;
var pollIncrement = 30000;
var pollDuration = 30000;

function addNotificationListener() {

}

function beginPolling() {
	poll();
	if(activelyListening) setTimeout(beginPolling, pollIncrement);
}

function deleteMessage() {

}

function informListeners() {

}

function listen() {
	activelyListening = true;
}

function poll() {
	if(!activelyListening) return;

	// a single HTTP long poll. 
	// request and return only.
}

function removeNotificationListener() {

}

function stopListening() {
	activelyListening = false;
}

module.exports = {
	listen: listen,
	stopListening: stopListening,
	addNotificationListener: addNotificationListener,
	removeNotificationListener: removeNotificationListener
};
