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
@class ConfigurationException
@description Exception returned for connection configuration exceptions.
*/
function ConfigurationException(err) {

	/**
	@memberof ConfigurationException
	@description Exception description.
	*/
	this.description = err.description || 'Configuration exception';

	/**
	@memberof ConfigurationException
	@description Detailed error message.
	*/
	this.message = err.message || 'Unknown Configuration Error';

}

module.exports = ConfigurationException;
