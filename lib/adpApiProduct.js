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

var mapProducts = require('./mapProducts');
var APIProductInstance = require('./apiProductInstance');
var log = require('winston');
var tmpMap = require('./tmpMap');

/**
@class ADPAPIProductFactory
*/
function ADPAPIProductFactory(map) {

	var mapped = mapProducts(map || tmpMap);

	/**
	@private
	@memberof ADPAPIProductFactory
	@description Intialize the {@link APIProductInstance} instance.
	@returns {void}
	*/
	this.createApiProduct = function createApiProduct(connection, productName) {
		var mappedProduct;

		mapped.forEach(function forEachCb(product) {
			if(productName === product.productName) {
				mappedProduct = product;
			}
		});
		if(mappedProduct) {
			return new APIProductInstance(connection, mappedProduct);
		} else {
			log.error('Unable to map api product ' + productName);
			return null;
		}
	};
}

module.exports = ADPAPIProductFactory;
