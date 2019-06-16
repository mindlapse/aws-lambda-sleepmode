# Sleep Mode

A Lambda that, when invoked, puts any instances to sleep that have the EC2
tag `Sleepy` = `True`.  It's scheduled to run every day at 6pm.


* Deploy with `serverless deploy`
* Run locally with `serverless invoke local -f sleepmode`
* Run remotely with `serverless invoke -f sleepmode`

## Config
* Update `functions.sleepmode.environment.SNS_TOPIC_ARN` in serverless.yml with the ARN of your own SNS topic to get notified when the Lambda executes.
