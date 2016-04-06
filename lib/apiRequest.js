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
var log = require('winston');
var APIException = require('./apiException');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

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
			if(resp && resp.statusCode !== 200) {
				log.info(opts.requestDesc + ' responded with status code ' + resp.statusCode);
				errObj = {
					statusCode: resp.statusCode,
					response: resp,
					message: opts.requestDesc + ' responded with status code ' + resp.statusCode
				};
			} else {
				try{
					if(typeof data === 'string') {
						parsed = JSON.parse(data);
					} else if(data) {
						parsed = data;
					}
				} catch(e) {
					log.error('Error parsing JSON response from ' + opts.requestDesc + '. Error: ' + e);
					errObj = {
						statusCode: resp.statusCode,
						response: resp,
						message: opts.requestDesc + ' responded with status code ' + resp.statusCode
					};
				}
			}
		}
		if(errObj) ex = new APIException(errObj);
		return cb(ex, parsed, responseHeaders);
	}

	if(opts.httpMethod === 'GET') {
		request.get({uri: opts.url, headers: opts.headers, agentOptions: opts.agentOptions}, response);
	} else if(opts.httpMethod === 'POST') {
		request({url: opts.url, headers: opts.headers, agentOptions: opts.agentOptions, method: 'POST', json: true, body: opts.payload}, response);
	} else if(opts.httpMethod === 'DELETE') {
		request.del({url: opts.url, headers: opts.headers, agentOptions: opts.agentOptions}, response);
	}
}

module.exports = APIRequest;
