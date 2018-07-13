'use strict';

const Alexa = require('ask-sdk');
const AWS = require('aws-sdk');
const config = require('./config');
// use 'ask-sdk' if standard SDK module is installed

// Code for the handlers here

let skill;
const ThingName = 'home-1-lamp';

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
    return handlerInput.requestEnvelope.request.type === 'Light';
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