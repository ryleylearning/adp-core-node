'use strict';
require('chai').should();

var APIProductInstance = require('../lib/apiProductInstance');
var log = require('winston');
/*
var adp = require('adp');
var ClientCredentialsConnType = adp.ClientCredentialsConnType;
var ConnectionFactory = adp.ADPAPIConnectionFactory;

var connectionFactory = new ConnectionFactory();

var validCCInitObject = {
	clientId: 'e62f181c-3233-4636-bb82-9be5c9f3e3e0',
	clientSecret: 'fbce97f8-5d3a-42cc-a774-9126c5270625',
	apiUrl: 'https://iat-api.adp.com',
	tokenUrl: 'https://iat-api.adp.com/auth/oauth/v2/token',
	sslCertPath: 'iatCerts/iat.pem',
	sslKeyPath: 'iatCerts/iat.key'
}
var validCCConnType = new ClientCredentialsConnType();
validCCConnType.init(validCCInitObject);
*/
var AdpApiProduct = require('../lib/adpApiProduct');
var connection = {
	connType: {
		apiUrl: 'https://iat-api.adp.com',
		sslCertPath: 'test/test.pem',
		sslKeyPath: 'test/test.key'
	},
	accessToken: 'something'
};

describe('ADP API Product module tests', function describeCb(){

	it('Should return instance of API Product instance when given valid product.', function itCb(done) {
		var apiProductInstance = new AdpApiProduct().createApiProduct(connection, 'UserInfo');
		(apiProductInstance instanceof APIProductInstance).should.equal(true);
		done();
	});

	it('Should not return instance of API Product instance when given invalid product.', function itCb(done) {
		var apiProductInstance = new AdpApiProduct().createApiProduct(connection, 'Invalid');
		(apiProductInstance instanceof APIProductInstance).should.equal(false);
		done();
	});	

	it('Should call method on API Product instance.', function itCb(done) {
		var apiProductInstance = new AdpApiProduct().createApiProduct(connection, 'UserInfo');
		apiProductInstance.call('read', {}, function readCb(err, data){
			(err === null).should.equal(false);
			done();
		});
	});	

	it('Should fail to call invalid method on API Product instance.', function itCb(done) {
		var apiProductInstance = new AdpApiProduct().createApiProduct(connection, 'UserInfo');
		apiProductInstance.call('Invalid', {}, function readCb(err, data){
			(err instanceof ReferenceError).should.equal(true);
			console.log('ERR', err, 'DATA', data);
			done();
		});
	});		

});