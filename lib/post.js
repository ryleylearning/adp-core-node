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
var log = require('winston');
var request = require('request');

function Post(opts, cb) {

	function response(err, resp, data) {
		if(err) {
			return cb(err, err);
		}
		log.info(opts.requestDesc + ' responded with status code ' + resp.statusCode);
		var parsed;
		if(resp.statusCode !== 200) {
			return cb({message: opts.requestDesc + ' failed.'}, null);
		}
		try{
			parsed = JSON.parse(data);
		} catch(e) {
			log.error('Error parsing JSON response from ' + opts.requestDesc);
			return cb(e, data);
		}
		return cb(err, parsed);
	}

	request.post(opts.url, opts.payload, response);
}

module.exports = Post;
