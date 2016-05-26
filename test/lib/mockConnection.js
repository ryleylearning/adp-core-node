
'use strict';

module.exports = {
	connType: {
		clientId: '88a73992-07f2-4714-ab4b-de782acd9c4d',
		clientSecret: 'a130adb7-aa51-49ac-9d02-0d4036b63541',
		apiUrl: 'http://localhost:55555',
		tokenUrl: 'http://localhost:55555/auth/oauth/v2/token',
		authorizationUrl: 'http://localhost:55555/auth/oauth/v2/authorize',
		sslKeyPath: 'test/test.key',
		sslCertPath: 'test/test.pem',
		granttype: 'client_credentials'
	},
	accessToken: 'someAccessTokenValue',
	connect: function connect() {}
};
