'use strict';

module.exports = function meta() {
    return {
        'meta': {
            '/data/transforms': [
                {
                    '/worker/person/legalAddress/lineOne': {
                        'readOnly': false,
                        'optional': false,
                        'hidden': false,
                        'maxLength': 40,
                        'shortLabelName': 'Address',
                        'longLabelName': 'Address',
                        'minItems': 0,
                        'maxItems': 0
                    },
                    '/worker/person/legalAddress/lineTwo': {
                        'readOnly': false,
                        'optional': true,
                        'hidden': false,
                        'maxLength': 40,
                        'pattern': '(Apt|Suite)',
                        'minItems': 1,
                        'maxItems': 1
                    },
                    '/worker/person/legalAddress/cityName': {
                        'readOnly': false,
                        'optional': false,
                        'hidden': false,
                        'maxLength': 30,
                        'shortLabelName': 'City',
                        'longLabelName': 'City'
                    },
                    '/worker/person/legalAddress/countrySubdivisionLevel2/longName': {
                        'readOnly': false,
                        'optional': true,
                        'hidden': false,
                        'maxLength': 15,
                        'shortLabelName': 'County',
                        'longLabelName': 'County'
                    },
                    '/worker/person/legalAddress/postalCode': {
                        'readOnly': false,
                        'optional': false,
                        'dependencies': {
                            'optional': {
                                'oneOf': {
                                    'value': false,
                                    'attributes': {
                                        '/worker/person/legalAddress/countryCode': {
                                            'pattern': '(US|CA)'
                                        }
                                    }
                                }
                            }
                        },
                        'hidden': false,
                        'maxLength': 10,
                        'shortLabelName': 'Postal Code',
                        'longLabelName': 'Postal Code'
                    },
                    '/worker/person/legalAddress/countryCode': {
                        'readOnly': false,
                        'optional': false,
                        'hidden': false,
                        'codeList': {
                            'links': [
                                {
                                    'rel': '/adp/codelist',
                                    'href': '/codelist',
                                    'method': 'GET',
                                    'encType': 'application/json',
                                    'mediaType': 'application/json'
                                }
                            ]
                        },
                        'dependencies': {
                            'pattern': {
                                'oneOf': [
                                    {
                                        'value': '^(US|CA)$',
                                        'attributes': {
                                            '/worker/person/legalAddress/countrySubdivisionLevel1': {
                                                'readOnly': false,
                                                'optional': false,
                                                'hidden': false,
                                                'codeList': {
                                                    'links': [
                                                        {
                                                            'rel': '/adp/codelist',
                                                            'href': '/dynamicCodelist?country={#/worker/person/legalAddress/countryCode}',
                                                            'method': 'GET',
                                                            'encType': 'application/json',
                                                            'mediaType': 'application/json'
                                                        }
                                                    ]
                                                },
                                                'shortLabelName': 'State',
                                                'longLabelName': 'State'
                                            },
                                            '/worker/person/legalAddress/countrySubdivisionLevel1/codeValue': {
                                                'readOnly': false,
                                                'optional': false,
                                                'hidden': false,
                                                'shortLabelName': 'State',
                                                'longLabelName': 'State'
                                            }
                                        }
                                    },
                                    {
                                        'value': '^((?!(US|CA)).)*$',
                                        'attributes': {
                                            '/worker/person/legalAddress/lineThree': {
                                                'readOnly': false,
                                                'optional': true,
                                                'hidden': false,
                                                'maxLength': 40
                                            },
                                            '/worker/person/legalAddress/lineFour': {
                                                'readOnly': false,
                                                'optional': true,
                                                'hidden': false,
                                                'maxLength': 40
                                            },
                                            '/worker/person/legalAddress/lineFive': {
                                                'readOnly': false,
                                                'optional': true,
                                                'hidden': false,
                                                'maxLength': 40
                                            }
                                        }
                                    }
                                ]
                            }
                        },
                        'shortLabelName': 'Country',
                        'longLabelName': 'Country'
                    }
                }
            ],
            '/data/eventContext': {
                '/worker/associateOID': {
                    'readOnly': true,
                    'optional': false,
                    'hidden': true
                }
            }
        }
    };
};
