# ADP User Info Library

### Description
The ADP User Info library wraps the API calls related to User Info API.

### Installation
```sh
$ npm install adp-connection
```

# Usage 

### Create Authorization Code ADP Connection and Call User Info
```javascript
var express = require('express');
var router = express.Router();
var connection;

/**
	1. CREATE CONNECTION CONFIGURAITON OBJECT (AuthorizationCodeConnType)
	2. INITIALIZE CONFIG OBJECT
	3. CREATE CONNECTION OBJECT
	4. INITIALIZE CONNECTION OBJECT WITH CONFIG OBJECT. 
	5. OBTAIN AUTHORIZATION REQUEST URL.
	6. REDIRECT. 
*/
router.get('/authenticate', function login(req, res) {
	var adp = require('adp');
	var ConnectionFactory = adp.ADPAPIConnectionFactory;
	var AuthorizationCodeConnType = adp.AuthorizationCodeConnType;
	var connType = new AuthorizationCodeConnType();
	var initObject = {
		clientId: 'ec762f06-7410-4f6d-aa82-969902c1836a',
		clientSecret: '6daf2cd7-4604-46c0-ab43-a645a6571d34',
		apiUrl: 'https://iat-api.adp.com',
		tokenUrl: 'https://iat-api.adp.com/auth/oauth/v2/token',
		authorizationUrl: 'https://iat-accounts.adp.com/auth/oauth/v2/authorize',
		sslKeyPath: 'iatCerts/iat.key',
		sslCertPath: 'iatCerts/iat.pem',
		callbackUrl: 'http://localhost:8889/callback'
	};
	connType.init(initObject);
	var connectionFactory = new ConnectionFactory();
	connection = connectionFactory.createConnection('authorization_code');
	connection.init(connType);

	var url = connection.getAuthorizationRequest();
	res.redirect(url);
});

/**
	7. AUTHORIZATION RESPONSE RECEIVED.
	8. OBTAIN AUTHORIZATION CODE FROM QUERY PARAM.
	9. OBTAIN STATE FROM QUERY PARAM.
	10. SET AUTHORIZATION CODE IN CONNECTION CONFIGURATION.
	11. CONNECT.
	12. UPON SUCCESSFUL CONNECTION, CALL USER INFO HELPER.
*/
router.get('/callback', function callback(req, res){
	var state = req.query.state;
	var code = req.query.code;
	if(!code) {
		log.error('Error, no authorization code received');
	}

	connection.connType.setAuthorizationCode(code);
	connection.connect(null, function connectCb(err){
		if(err) {
			log.error('Connection failed!');
		} else {
			var userInfoHelper = new UserInfoHelper(connection);
			userInfoHelper.getUserInfo({}, function getUserInfoCb(err, data){
				if(err) {
					res.send('Error getting user info.');
				} else {
					res.send(data);
				}
				res.end();
			});
		}
	});
});

```
# Contributing
To contribute to the library, please generate a pull request. Before generating the pull request, please insure the following:
1. Appropriate unit tests have been updated or created.
2. Code coverage on unit tests must be no less than 95%.
3. Your code updates have been fully tested and linted with no errors. 
4. Update README and API documentation as appropriate.

# Sample Client
A sample client is provided to demonstrate usage of the libraries. The sample client connects to a sandbox environment hosted by ADP, and comes preconfigured with the necessary credentials and certificates to connect to the sandbox server.

### Authorization Code Example
```sh
$ git clone https://github.com/adplabs/adp-connection-node.git
$ npm install
$ node authorizationCodeExample
```

# API Documentation (JSDoc)
```sh
$ npm run docs
```

# Test Execution
```sh
$ npm test
```

# Code Coverage
```sh
$ npm run coverage
```

# Lint
```sh
$ npm run lint
```

# License 
[Apache 2](http://www.apache.org/licenses/LICENSE-2.0)
