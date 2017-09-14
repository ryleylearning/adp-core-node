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

var defaultPayload = require('./defaultPayload');
var objectPath = require('simple-object-path');
var deleteVals = ['DELETE_STRING', 'DELETE_NUMBER', 'DELETE_BOOLEAN', 'DELETE_FLOAT', 'DELETE_DOUBLE', 'DELETE_INTEGER', 'DELETE_LONG', 'DELETE_DEFAULT', 'DELETE_DATETIME', 'DELETE_DATE', 'DELETE_EXAMPLE', 'DELETE_ENUM'];

function removeUnusedProperties(payload) {
	var event = payload.events[0];
	delete payload.meta;
	delete payload.confirmMessage;
	delete event.eventID;
	delete event.eventTitle;
	delete event.eventSubTitle;
	delete event.eventReasonCode;
	delete event.eventStatusCode;
	delete event.priorityCode;
	delete event.recordDateTime;
	delete event.creationDateTime;
	delete event.effectiveDateTime;
	delete event.expirationDateTime;
	delete event.dueDateTime;
	delete event.originator;
	delete event.actor;
	delete event.actAsParty;
	delete event.onBehalfOfParty;
	delete event.links;
	delete event.data.output;
	delete event.data.eventContext.contextExpressionID;
	delete event.data.transform.eventReasonCode;
	delete event.data.transform.eventStatusCode;
	delete event.data.transform.effectiveDateTime;

	return payload;
}

function removePropsNotSet(payload, payloadDataPaths) {
	var deleted = false;
	var remove = [];
	payloadDataPaths.sort();
	payloadDataPaths.forEach(function payloadDataPathsForEachCb(dataPath, idx) {
		var objVal = objectPath(payload, dataPath);
		if(~['boolean', 'number'].indexOf(typeof objVal)) objVal = true;
		if(~deleteVals.indexOf(objVal)) objVal = false;
		if(objVal && typeof objVal === 'object' && Object.keys(objVal).length === 0) objVal = false;
		if(!objVal) {
			var props = dataPath.split('/');
			var propName = props.pop();
			var objPath = props.join('/');
			var obj = props.length === 0 ? payload : objectPath(payload, objPath);
			if(obj) {
				delete obj[propName];
				remove.push(idx);
				deleted = true;
			}
		}
	});
	remove.sort().reverse().forEach(function removeForEachCb(idx) {
		payloadDataPaths.splice(idx, 1);
	});
	if(deleted) removePropsNotSet(payload, payloadDataPaths);
	return payload;
}

module.exports = {
	defaultPayload: defaultPayload,
	removeUnusedProperties: removeUnusedProperties,
	removePropsNotSet: removePropsNotSet
};
