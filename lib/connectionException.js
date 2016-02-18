'use strict';

var statusMap = require('http').STATUS_CODES;
var oauthCodeMap = require('./oauthCodeMap');

/**
@class ConnectionException
@description Exception returned upon API call exception or invalid response.
*/
function ConnectionException(err) {

	/**
	@memberof ConnectionException
	@description HTTP status code of the request.
	*/
	this.statusCode = err.statusCode || 0;

	/**
	@memberof ConnectionException
	@description HTTP status description.
	*/
	this.statusDesc = statusMap[this.statusCode] || 'No Status Description';

	/**
	@memberof ConnectionException
	@description Detailed authentication error message.
	*/
	this.message = oauthCodeMap(err.oauthResponse || {}) || 'Unknown Authentication Error';

	/**
	@memberof ConnectionException
	@description Original HTTP response object.
	*/
	this.response = err.response || {};

}

module.exports = ConnectionException;
