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

var request = require('request');
var debug = require('./debug');
var APIException = require('./apiException');
var pkg = require('../package.json');

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

function addUserAgent(opts) {
	opts.headers = opts.headers || {};
	opts.headers['User-Agent'] = pkg.name + '-node/' + pkg.version;
}

function APIRequest(opts, cb) {

	function response(err, resp, data) {
		var errObj;
		var ex;
		var parsed;
		var responseHeaders = {};

		if(err) {
			errObj = {
				statusCode: 0,
				response: err,
				message: opts.requestDesc + ' - HTTP Exception Error.'
			};
		} else {
			if(resp && resp.headers) responseHeaders = resp.headers;
			if(resp && !~[200, 201, 202, 204].indexOf(resp.statusCode)) {
				debug(opts.requestDesc + ' responded with status code ' + resp.statusCode);
				errObj = {
					statusCode: resp.statusCode,
					response: resp,
					message: opts.requestDesc + ' responded with status code ' + resp.statusCode
				};
			} else {
				debug(opts.requestDesc + ' responded with status code ' + resp.statusCode);
				try{
					if(typeof data === 'string' && data.length > 0) {
						parsed = JSON.parse(data);
					} else if(data) {
						parsed = data;
					}
				} catch(e) {
					debug('Error parsing JSON response from ' + opts.requestDesc + '. Error: ' + e);
					errObj = {
						statusCode: resp.statusCode,
						response: resp,
						message: 'Invalid JSON. ' + opts.requestDesc + ' responded with status code ' + resp.statusCode
					};
				}
			}
		}
		if(errObj) ex = new APIException(errObj);
		return cb(ex, parsed, responseHeaders);
	}

	addUserAgent(opts);
	debug('Request options: ' + JSON.stringify(opts));
	if(opts.httpMethod === 'GET') {
		request.get({uri: opts.url, qs: opts.qs, headers: opts.headers, agentOptions: opts.agentOptions}, response);
	} else if(opts.httpMethod === 'POST') {
		request({url: opts.url, headers: opts.headers, agentOptions: opts.agentOptions, method: 'POST', json: true, body: opts.payload}, response);
	} else if(opts.httpMethod === 'DELETE') {
		request.del({url: opts.url, headers: opts.headers, agentOptions: opts.agentOptions}, response);
	}
}

module.exports = APIRequest;
