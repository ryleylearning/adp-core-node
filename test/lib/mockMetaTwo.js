
'use strict';

module.exports = function meta() {
    return {
        "meta": {
            "/data/eventContext": {
                "/worker": {
                    "readOnly": true,
                    "optional": false
                },
                "/worker/associateOID": {
                    "readOnly": true,
                    "optional": false,
                    "hidden": true
                }
            },
            "/data/transforms": [
                {
                    "/worker/person/legalName/generationAffixCode": {
                        "codeList": {
                            "listItems": [
                                {
                                    "codeValue": "",
                                    "shortName": ""
                                },
                                {
                                    "codeValue": "2nd",
                                    "shortName": "2nd"
                                },
                                {
                                    "codeValue": "3rd",
                                    "shortName": "3rd"
                                },
                                {
                                    "codeValue": "4th",
                                    "shortName": "4th"
                                },
                                {
                                    "codeValue": "5th",
                                    "shortName": "5th"
                                },
                                {
                                    "codeValue": "I",
                                    "shortName": "I"
                                },
                                {
                                    "codeValue": "II",
                                    "shortName": "II"
                                },
                                {
                                    "codeValue": "III",
                                    "shortName": "III"
                                },
                                {
                                    "codeValue": "IV",
                                    "shortName": "IV"
                                },
                                {
                                    "codeValue": "V",
                                    "shortName": "V"
                                },
                                {
                                    "codeValue": "Jr.",
                                    "shortName": "Jr."
                                },
                                {
                                    "codeValue": "Sr.",
                                    "shortName": "Sr."
                                }
                            ]
                        },
                        "readOnly": false,
                        "optional": true,
                        "hidden": false,
                        "shortLabelName": "Generation Suffix"
                    },
                    "/worker/person/legalName/preferredSalutations": {
                        "minItems": 0,
                        "maxItems": 1
                    },
                    "/worker/person/legalName/preferredSalutationsFoo": {
                        "minItems": 3,
                        "maxItems": 4
                    },
                    "/worker/person/legalName": {
                        "readOnly": false,
                        "optional": false
                    },
                    "/worker/person/legalName/generationAffixCode/shortName": {
                        "readOnly": false,
                        "optional": true,
                        "hidden": false
                    },
                    "/worker/person/legalName/generationAffixCode/codeValue": {
                        "readOnly": true,
                        "optional": true,
                        "hidden": false
                    },
                    "/worker/person/legalName/qualificationAffixCode": {
                        "codeList": {
                            "listItems": [
                                {
                                    "codeValue": "",
                                    "shortName": ""
                                },
                                {
                                    "codeValue": "CFA",
                                    "longName": "CFA - Certified Financial Analyst"
                                },
                                {
                                    "codeValue": "CFP",
                                    "longName": "CFP - Certified Financial Planner"
                                },
                                {
                                    "codeValue": "CPA",
                                    "longName": "CPA - Certified Public Accountant"
                                },
                                {
                                    "codeValue": "DDS",
                                    "longName": "DDS - Doctor of Dental Science"
                                },
                                {
                                    "codeValue": "DMD",
                                    "longName": "DMD - Doctor of dental Medicine"
                                },
                                {
                                    "codeValue": "DO",
                                    "longName": "DO -  Doctor of Osteopathic Medicine"
                                },
                                {
                                    "codeValue": "DPM",
                                    "longName": "DPM - Doctor of Podiatric Medicine"
                                },
                                {
                                    "codeValue": "DVM",
                                    "longName": "DVM - Doctor of Veterinary Medicine"
                                },
                                {
                                    "codeValue": "Esq.",
                                    "shortName": "Esq. - Esquire"
                                },
                                {
                                    "codeValue": "JD",
                                    "longName": "JD - Doctor of Jurisprudence"
                                },
                                {
                                    "codeValue": "MD",
                                    "longName": "MD - Doctor of Medicine"
                                },
                                {
                                    "codeValue": "NP",
                                    "longName": "NP - Nurse Practitioner"
                                },
                                {
                                    "codeValue": "PA",
                                    "longName": "PA - Physician Assistant"
                                },
                                {
                                    "codeValue": "PharmD",
                                    "longName": "PharmD - Doctor of Pharmacy"
                                },
                                {
                                    "codeValue": "PhD",
                                    "longName": "PhD - Doctor of Philosopy"
                                },
                                {
                                    "codeValue": "RN",
                                    "longName": "RN - Registered Nurse"
                                }
                            ]
                        },
                        "readOnly": false,
                        "optional": true,
                        "hidden": false,
                        "shortLabelName": "Professional Suffix"
                    },
                    "/worker/person/legalName/qualificationAffixCode/shortName": {
                        "readOnly": false,
                        "optional": true,
                        "hidden": false
                    },
                    "/worker/person/legalName/formattedName": {
                        "readOnly": true,
                        "optional": true,
                        "hidden": false
                    },
                    "/worker/person/legalName/middleName": {
                        "readOnly": false,
                        "optional": true,
                        "hidden": false,
                        "shortLabelName": "Middle Name",
                        "minLength": 0,
                        "maxLength": 64
                    },
                    "/worker/person/legalName/familyName1": {
                        "readOnly": false,
                        "optional": false,
                        "hidden": false,
                        "shortLabelName": "Last Name",
                        "minLength": 1,
                        "maxLength": 64
                    },
                    "/worker/person/legalName/qualificationAffixCode/codeValue": {
                        "readOnly": true,
                        "optional": true,
                        "hidden": false
                    },
                    "/worker/person/legalName/preferredSalutations/salutationCode/shortName": {
                        "readOnly": false,
                        "optional": true,
                        "hidden": false
                    },
                    "/worker/person/legalName/preferredSalutations/salutationCode": {
                        "codeList": {
                            "listItems": [
                                {
                                    "codeValue": "",
                                    "shortName": ""
                                },
                                {
                                    "codeValue": "Dr.",
                                    "shortName": "Dr."
                                },
                                {
                                    "codeValue": "Hon.",
                                    "shortName": "Hon."
                                },
                                {
                                    "codeValue": "Miss",
                                    "shortName": "Miss"
                                },
                                {
                                    "codeValue": "Mrs.",
                                    "shortName": "Mrs."
                                },
                                {
                                    "codeValue": "Mr.",
                                    "shortName": "Mr."
                                },
                                {
                                    "codeValue": "Ms.",
                                    "shortName": "Ms."
                                },
                                {
                                    "codeValue": "Msgr.",
                                    "shortName": "Msgr."
                                },
                                {
                                    "codeValue": "Rabbi",
                                    "shortName": "Rabbi"
                                },
                                {
                                    "codeValue": "Rev.",
                                    "shortName": "Rev."
                                }
                            ]
                        },
                        "readOnly": false,
                        "optional": true,
                        "hidden": false,
                        "shortLabelName": "Salutation"
                    },
                    "/worker/person/legalName/preferredSalutations/salutationCode/codeValue": {
                        "readOnly": true,
                        "optional": true,
                        "hidden": false
                    },
                    "/worker/person/legalName/nickName": {
                        "readOnly": false,
                        "optional": true,
                        "hidden": false,
                        "shortLabelName": "Preferred Name",
                        "minLength": 0,
                        "maxLength": 64
                    },
                    "/worker/person": {
                        "readOnly": false,
                        "optional": false
                    },
                    "/worker/person/legalName/givenName": {
                        "readOnly": false,
                        "optional": false,
                        "hidden": false,
                        "shortLabelName": "First Name",
                        "minLength": 1,
                        "maxLength": 64
                    }
                }
            ]
        }
    };
};
