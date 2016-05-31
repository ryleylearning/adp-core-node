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
@class ValidationException
@description Event-related exceptions.
*/
function ValidationException(err) {

	/**
	@memberof ValidationException
	@description Detailed error message.
	*/
	this.message = err.message || 'Unknown Event Error';

	this.pathToError = err.path || 'Path unknown';

	this.description = err.description || 'Event exception';

	this.context = (function context() {
		var val = err.value || '';
		if(typeof err.value === 'object' && err.value !== null) {
			val = JSON.stringify(err.value);
		}
		return val;
	})();

}

module.exports = ValidationException;
