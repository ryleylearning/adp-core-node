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

var request = require('./apiRequest');
var interpolate = require('./interpolate');
var _ = require('underscore');
var fs = require('fs');

function getMeta(conn, apicall, cb) {
	var options = {
		requestDesc: 'Meta.' + apicall.methodName,
		httpMethod: apicall.method,
		url: conn.connType.apiUrl + apicall.metaPath,
		headers: {
			Authorization: 'Bearer ' + conn.accessToken
		},
		agentOptions: {
			ca: [fs.readFileSync(conn.connType.sslCertPath)],
			key: fs.readFileSync(conn.connType.sslKeyPath),
			cert: fs.readFileSync(conn.connType.sslCertPath)
		}
	};
	request(options, cb);
}

function validateAgainstMeta(conn, path, data) {

};

function MetaValidator() {
	var allMeta = [];
	this.validate = function validate(opts, cb) {
		var meta = _.where(allMeta, {metaPath: opts.apiInfo.metaPath})[0];
		if(meta) {
			validateAgainstMeta(meta, opts.dataPath, opts.data);
			cb();
		} else {
			getMeta(opts.conn, opts.apiInfo, function getMetaCb(err, newMeta) {
				if(!newMeta) {
					newMeta = require('../meta/' + opts.apiInfo.tmpMeta);
				}
				console.log(newMeta);
				allMeta.push(newMeta);
				validateAgainstMeta(newMeta, opts.dataPath, opts.data);
				cb();
			});
		}
	};
}

module.exports = new MetaValidator();

