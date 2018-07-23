// const Alexa = require('ask-sdk');
const AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-west-2'
})

const config = require('../config');

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
})