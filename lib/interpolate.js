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

/**
@module interpolate
@description Replace string variables using an object map.
@param val {string} Template string with variable place holders.
@param opts {object} Object literal with replacement properties.
@returns val {string}
@example
interpolate('replace place holders between the {somereplacement}', {somereplacement: 'braces'}) -> 'replace place holders between the braces'
*/
module.exports = function interpolate(val, opts) {
	var beginMarker = '{';
	var endMarker = '}';
	var keep = false;
	var param = '';
	var params = [];
	var tmpVal = val;
	for(var i = 0; i < tmpVal.length; i++) {
		if(tmpVal[i] === beginMarker) {
			keep = true;
		}
		if(keep) {
			param += tmpVal[i];
		}
		if(tmpVal[i] === endMarker && param.length > 0) {
			keep = false;
			params.push(param);
			param = '';
		}
	}
	params.forEach(function paramsForEachCb(p) {
		var cleaned = p.substring(1, p.length - 1);
		if(opts[cleaned]) {
			tmpVal = tmpVal.replace(p, opts[cleaned]);
		} else {
			// log error.
		}
	});
	return tmpVal;
};
