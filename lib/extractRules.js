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

var objectPath = require('simple-object-path');

function extractRules(meta) {
	var allRules = [];
	if(!meta) return allRules;
	var watchedProps = ['readOnly', 'optional', 'hidden', 'minItems', 'maxItems', 'minLength', 'maxLength', 'shortLabelName', 'pattern'];
	meta.forEach(function metaForEachCb(m) {
		var rules = {};
		var path = m.path;
		var propName = path.substring(path.lastIndexOf('/') + 1, path.length);
		if(m.meta) {
			var codeListEnum = objectPath(m, 'meta/codeList/listItems');
			if(codeListEnum && codeListEnum.length > 0) rules.enum = codeListEnum;
			Object.keys(m.meta).forEach(function keysForEachCb(key) {
				if(~watchedProps.indexOf(key)) rules[key] = m.meta[key];
			});
		}
		allRules.push({
			propName: propName,
			fullPath: path,
			rules: rules
		});
	});
	return allRules;
}

module.exports = extractRules;
