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
var debug = require('./debug');
var request = require('request');
var APIException = require('./apiException');
var pkg = require('../package.json');
var _ = require('underscore');

function addUserAgent(opts) {
	opts.headers = opts.headers || {};
	opts.headers['User-Agent'] = pkg.name + '-node: ' + pkg.version;
}

function Post(opts, cb) {

	function response(err, resp, data) {
		var errObj;
		var ex;
		var parsed;

		if(err) {
			errObj = {
				statusCode: 0,
				response: err,
				message: opts.requestDesc + ' - HTTP Exception Error.'
			};
		} else {
			if(resp && resp.statusCode !== 200) {
				debug(opts.requestDesc + ' responded with status code ' + resp.statusCode);
				errObj = {
					statusCode: resp.statusCode,
					response: resp,
					message: opts.requestDesc + ' responded with status code ' + resp.statusCode
				};
			} else {
				try{
					parsed = JSON.parse(data);
				} catch(e) {
					debug('Error parsing JSON response from ' + this.requestDesc);
					return cb(e, data);
				}
			}
		}
		if(errObj) ex = new APIException(errObj);
		return cb(ex, parsed);
	}
	addUserAgent(opts);
	var postopts = {
		uri: opts.url,
		headers: opts.headers,
		method: 'POST'
	};
	postopts = _.extend(postopts, opts.payload);
	request.post(postopts, response);
}

module.exports = Post;
