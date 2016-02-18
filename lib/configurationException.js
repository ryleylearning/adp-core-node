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
