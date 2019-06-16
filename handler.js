'use strict';
var AWS = require('aws-sdk');

const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN

const stopInstances = async (ec2, instanceIds) => {
  const params = {
    InstanceIds: instanceIds
  };
  
  try {
    let response = await ec2.stopInstances(params).promise()
    console.log("Have response: ", response)
  } catch (e) {
    console.log("Error:", e)
  }
}

const sendNotification = async (instanceIds) => {
  const sns = new AWS.SNS()
  console.log(`Sending notification to ${SNS_TOPIC_ARN}`)
  try {
    const response = await sns.publish({
      TopicArn : SNS_TOPIC_ARN,
      // Subject : `SleepMode engaged!`,
      Message : `Stopped ${instanceIds}`
    }).promise()
    console.log(response)
  } catch (e) {
    console.log(e)
  }
}


module.exports.sleepmode = async (event) => {
  
  var ec2 = new AWS.EC2()
  var params = {
    Filters: [{
      Name: "tag:Sleepy", 
      Values: [
        "True"
      ]
    }]
  };
  const results = await ec2.describeInstances(params).promise();
  
  const stops = []
  if (results.Reservations) {
    for (let res = 0; res < results.Reservations.length; res++) {
      let reservation = results.Reservations[res]
      let numInstances = reservation.Instances.length;
      for (let i = 0; i < numInstances; i++) {
        let instance = reservation.Instances[i]
        if (instance.State.Name == 'running') {
          console.log(`Planning to stop ${instance.InstanceId}`)
          stops.push(instance.InstanceId)
        }
      }
    }
  }
  if (stops.length > 0) {
    console.log(`Stopping ${stops}`)
    await stopInstances(ec2, stops)
    if (SNS_TOPIC_ARN) {
      console.log("Sending notfication")
      await sendNotification(stops)
    } else {
      console.log("No notification topics have been set")
    }
  }
  console.log("Complete!")
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      stopped: stops,
      input: event,
    }, null, 2),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
