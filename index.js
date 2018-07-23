'use strict';

const Alexa = require('ask-sdk');
const AWS = require('aws-sdk');
const config = require('./config');

AWS.config.update({
  region: 'us-west-2'
})

let skill;
let thingName;

exports.handler = async function (event, context) {
  console.log(`REQUEST++++${JSON.stringify(event)}`);
  if (!skill) {
    skill = Alexa.SkillBuilders.custom()
      .addRequestHandlers(
        LaunchRequestHandler,
        LightIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
      )
      .create();
  }

  return skill.invoke(event,context);
}

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'This is Bob, you can say turn on or turn off the light!';
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('The light', speechText)
      .getResponse();
  }
};

const LightIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'Light';
  },
  handle(handlerInput) {
    console.log('haha:' + handlerInput.session)
    console.log('hehe:' + handlerInput.requestEnvelope.session)

    const ddb = new AWS.DynamoDB.DocumentClient()
    const params = {
      TableName: config.dynamoDB.tablePrefix + 'Things',
      ExpressionAttributeValues: {
        ":userId": "us-west-2:dc5dc6d6-ead3-4605-b64d-96efd07d40da",
        ":alexaType": "Skill"
      },
      KeyConditionExpression: "userId = :userId",
      FilterExpression: "alexaType = :alexaType"
    }

    ddb.query(params, function (err, data) {
      if (err) { console.error(err); return }
      console.log(data.Items[0].thingName)
      thingName = data.Items[0].thingName
    })

    if ( handlerInput.requestEnvelope.request.intent.slots && handlerInput.requestEnvelope.request.intent.slots.status) {
      const status = handlerInput.requestEnvelope.request.intent.slots.status.value
      const iotData = new AWS.IotData({
        endpoint: config.iotEndpoint
      })
      if (status === 'on') {
        return new Promise(resolve => {
          iotData.updateThingShadow({
            thingName: ThingName,
            payload: JSON.stringify({
              state: {
                desired: {
                  status: 'on'
                }
              }
            })
          }).promise().then(() => {
            const speechText = 'turning on the light.'
            resolve(handlerInput.responseBuilder.speak(speechText).getResponse())
          })
        })
      } else if (status === 'off') {
        return new Promise(resolve => {
          iotData.updateThingShadow({
            thingName: ThingName,
            payload: JSON.stringify({
              state: {
                desired: {
                  status: 'off'
                }
              }
            })
          }).promise().then(() => {
            const speechText = 'turning off the light.'
            resolve(handlerInput.responseBuilder.speak(speechText).getResponse())
          })
        })
      }
    } else {
      const speechText = 'Unsupported command, please say turn on or turn off the light.'
      return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard('light on or off', speechText)
        .getResponse();
    }
  }
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can say turn on or turn off the light!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Turn on or turn off the light', speechText)
      .getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Bye Bye', speechText)
      .getResponse();
  }
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    //any cleanup logic goes here
    return handlerInput.responseBuilder.getResponse();
  }
};