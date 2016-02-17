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

module.exports = {
	products: [
		{
			productName: 'UserInfo',
			calls: [{
				path: '/core/v1/userinfo',
				methodName: 'read'
			}]
		},
		{
			productName: 'Worker',
			calls: [{
				path: '/hr/v1/workers/{associateoid}',
				methodName: 'read'
			}]
		},
		{
			productName: 'TaxStatement',
			calls: [{
				path: '/v1_0/O/A/payStatements?numberoflastpaydates=26',
				methodName: 'read'
			}]
		},
		{
			productName: 'CorpDirectory',
			calls: [{
				path: '/v1_0/O/corporateContacts',
				methodName: 'read'
			}]
		}
	]
};
