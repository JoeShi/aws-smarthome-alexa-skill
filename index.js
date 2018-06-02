'use strict';

const Alexa = require('ask-sdk');
const AWS = require('aws-sdk');
// use 'ask-sdk' if standard SDK module is installed

// Code for the handlers here

let skill;
const ThingName = 'air-purifier-1';

exports.handler = async function (event, context) {
  console.log(`REQUEST++++${JSON.stringify(event)}`);
  if (!skill) {
    skill = Alexa.SkillBuilders.custom()
      .addRequestHandlers(
        LaunchRequestHandler,
        AirPurifierIntentHandler,
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
    const speechText = 'This is Puppy, you can say turn on or turn off the air purifier!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('The air purifier', speechText)
      .getResponse();
  }
};

const AirPurifierIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AirPurifier';
  },
  handle(handlerInput) {
    if ( handlerInput.requestEnvelope.request.intent.slots && handlerInput.requestEnvelope.request.intent.slots.status) {
      const status = handlerInput.requestEnvelope.request.intent.slots.status.value
      const iotData = new AWS.IotData({
        endpoint: 'abty4kifln98q.iot.ap-northeast-1.amazonaws.com'
      })
      if (status === 'on') {
        return new Promise(resolve => {
          iotData.updateThingShadow({
            thingName: ThingName,
            payload: JSON.stringify({
              state: {
                desired: {
                  fan: 'on'
                }
              }
            })
          }).promise().then(() => {
            const speechText = 'turning on the air purifier.'
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
                  fan: 'off'
                }
              }
            })
          }).promise().then(() => {
            const speechText = 'turning off the air purifier.'
            resolve(handlerInput.responseBuilder.speak(speechText).getResponse())
          })
        })
      }
    } else {
      const speechText = 'Unsupported command, please say turn on or turn off the air purifier.'
      return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard('air purifier on or off', speechText)
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
    const speechText = 'You can say turn on or turn off the air purifier!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Turn on or turn off the air purifier', speechText)
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