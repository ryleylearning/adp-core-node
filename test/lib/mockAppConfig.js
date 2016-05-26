'use strict';

module.exports = function mockConfig() {
	return {
		appName: 'mock app',
		calls: [
			{
				'canonicalUri': '/hr/workerInformationManagement/workerManagement/addressManagement/worker.legalAddress.change',
				'path': '/testevent',
				'metaPath': '/testmeta',
				'method': 'POST',
				'methodName': 'test_event',
				'schemaName': 'testAddressSchema'
			},
			{
				'canonicalUri': '/hr/workerInformationManagement/workerManagement/addressManagement/worker.legalName.change',
				'path': '/testeventtwo',
				'metaPath': '/testmetatwo',
				'method': 'POST',
				'methodName': 'test_event_two',
				'schemaName': 'testNameSchema'
			},
			{
				'canonicalUri': '/hr/workerInformationManagement/workerManagement/addressManagement/worker.legalAddress.change',
				'path': '/testget',
				'method': 'GET',
				'methodName': 'test_get'
			},
			{
				'canonicalUri': '/hr/workerInformationManagement/workerManagement/addressManagement/worker.legalAddress.change',
				'path': '/testrequestfailone',
				'method': 'GET',
				'methodName': 'test_fail_one'
			},
			{
				'canonicalUri': '/hr/workerInformationManagement/workerManagement/addressManagement/worker.legalAddress.change',
				'path': '/testrequestfailtwo',
				'method': 'GET',
				'methodName': 'test_fail_two'
			},
			{
				'canonicalUri': '/hr/workerInformationManagement/workerManagement/addressManagement/worker.legalAddress.change',
				'path': '/testdelete',
				'method': 'DELETE',
				'methodName': 'test_delete'
			}
		]
	};
};
