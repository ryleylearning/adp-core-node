'use strict';

var statusMap = require('http').STATUS_CODES;

/**
@class APIException
@description Exception returned upon API call exception or invalid response.
*/
function APIException(err) {

	/**
	@memberof APIException
	@description HTTP status code of the request.
	*/
	this.statusCode = err.statusCode || 0;

	/**
	@memberof APIException
	@description HTTP status description.
	*/
	this.statusDesc = statusMap[this.statusCode] || 'No Status Description';

	/**
	@memberof APIException
	@description Detailed error message.
	*/
	this.message = err.message || 'Unknown API Error';

	/**
	@memberof APIException
	@description Original HTTP response object.
	*/
	this.response = err.response || {};

}

module.exports = APIException;
