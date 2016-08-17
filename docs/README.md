# ADP Core API

* [Core](#core)
    * [consumerApplicationInstance](#consumerapplicationinstance)

* [ConsumerApplicationInstance](#consumer-application-instance)
    * [createEvent](#createevent)
    * [exec](#exec)
    * [getData](#getdata)
    * [getEventRules](#geteventrules)
    * [getNextEvent](#getnextevent)
    * [getConnection](#getconnection)
    * [getConsumerApplication](#getconsumerapplication)
    * [saveEvent](#saveevent)

# Core

## consumerApplicationInstance
---
#### Description 
Create consumer application instance. This is the entry point for calling ADP APIs. 

#### Params
* ADP Connection Instance {Object}
* Configuration Path {String}

#### Example

```js
import adpConnection from 'adp-connection';
import adpCore from 'adp-core';
import config from './config';

const connectionOpts = config.get('connection');
const conn = adpConnection.createConnection(connectionOpts);

// conn.connect ...

const configPath = __dirname + './config.zip';
const app = adpCore.consumerApplicationInstance(conn, configPath);
```

# Consumer Application Instance

## createEvent
---
#### Description 
Use this method to obtain a valid payload related to the requested methodName. The payload will be returned with an `eventId` property. *This property **must not** be deleted*. This payload will be returned with defaulted values -- some of which are `DEFAULT_STRING`, `DEFAULT_NUMBER`, `DEFAULT_BOOLEAN`. Properties which are contain these defalut values are **automatically** deleted upon save (`saveEvent`).

#### Params
* Options {Object} - Object containing `methodName` property.
* Callback {Function} - Callback to be executed once event is initialized.

#### Example

```js
const app = adpCore.consumerApplicationInstance(conn, configPath);
const eventOpts = {
    methodName: 'event.core.v1.legal.name.change'
};
const eventCreated = (err, payload) => {
    // business logic.
};
app.createEvent(eventOpts, eventCreated);
```

## exec
---
###### alias: [getData](#getData)

#### Description 
Use this method to execute non-event driven API requests. Ideal for HTTP `DELETE` requests.

#### Params
* MethodName {String} - API Method name property.
* Options {Object} - Object literal containing key value pairs. Should contain any URI replacements or `payload` property in the case of saving an event.
* Callback {Function} - Callback to be executed once response is received.

#### Example

```js
const app = adpCore.consumerApplicationInstance(conn, configPath);
const methodName = 'hr.v2.worker.associateoid';
const execOpts = {
    associateoid: '0000000000000000'
};
const handleResponse = (err, payload) => {
    // business logic.
};
app.exec(methodName, execOpts, handleResponse);
```

## getData
---
#### Description 
Use this method to execute non-event driven API requests. Ideal for HTTP `GET` requests.

#### Params
* MethodName {String} - API Method name property.
* Options {Object} - Object literal containing key value pairs. Should contain any URI replacements or `payload` property in the case of saving an event.
* Callback {Function} - Callback to be executed once data is received.

#### Example

```js
const app = adpCore.consumerApplicationInstance(conn, configPath);
const methodName = 'hr.v2.worker.associateoid';
const execOpts = {
    associateoid: '0000000000000000'
};
const handleResponse = (err, payload) => {
    // business logic.
};
app.getData(methodName, execOpts, handleResponse);
```

## getEventRules
---

#### Description 
Use this method to obtain validation rules for a given event (methodName). These event rules can be used to implement client validations.

#### Params
* Options {Object} - Object containing `methodName` property.
* Callback {Function} - Callback to be executed once event rules are available.

#### Example

```js
const app = adpCore.consumerApplicationInstance(conn, configPath);
const eventOpts = {
    methodName: 'event.core.v1.legal.name.change'
};
const rulesReceived = (err, rules) => {
    // implement client validations.
};
app.getEventRules(eventOpts, rulesReceived);
```

## getNextEvent
---
#### Description 
Use this method to obtain the next event notification on your application message queue. The messages are returned as JSON.

#### Params
* Callback {Function} - Callback to be executed once event is initialized.

#### Example

```js
const app = adpCore.consumerApplicationInstance(conn, configPath);
const completed = (err, eventMessage) => {
    // handle event notification message.
};
app.getNextEvent(eventOpts, completed);
```

## getConnection
---
#### Description 
Use this method to obtain the connection object used by the consumer application instance object.

#### Params
* None

#### Example

```js
const app = adpCore.consumerApplicationInstance(conn, configPath);
const conn = app.getConnection();
```


## getConsumerApplication
-----------
#### Description 
Use this method to obtain the consumer application instance config JSON object.

#### Params
* None

### Returns
* appConfig {Object} - Object representing the consumer application configuration object.

#### Example

```js
const app = adpCore.consumerApplicationInstance(conn, configPath);
const appConfig = app.getConsumerApplication();
```

## saveEvent
---
#### Description 
This is a companion method to `createEvent`. This method must use the `payload` returned by `createEvent` method. The payload object should be populated with desired fields and then passed to `saveEvent`. 

##### Examining results
The result set will be either validation errors or a successful save body. 

#### Params
* Payload {Object} - JSON Object returned by `createEvent` with desired updates.
* Callback {Function} - Callback to be executed once event is saved.

#### Example

```js
const app = adpCore.consumerApplicationInstance(conn, configPath);
const eventCreated = (err, payload) {
    payload.events[0].data.eventContext.associateOID = '0000000000000000';
    payload.events[0].data.transform.worker.person.legalName.givenName = 'Doe';
    app.saveEvent(payload, eventSaved);
};
const eventSaved = (err, results) => {
    // business logic.
};
const eventOpts = {
    methodName: 'event.core.v1.legal.name.change'
};
app.createEvent(eventOpts, eventCreated)
```

