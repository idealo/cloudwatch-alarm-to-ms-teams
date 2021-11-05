# cloudwatch-alarm-to-ms-teams

This is a simple application that allows you to show CloudWatch Alarms as Microsoft Teams notifications.
It utilizes the webhook connector from Microsoft Teams to push the data to your channels.

## Getting Started

1. You will need to install the Microsoft Teams Webhook Connector into your channel. Please follow the [official documentation](https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook#create-incoming-webhook-1) for the channel in which you want to receive the notifications. Copy the incoming webhook URL at the end.
2. Install this application from the [Serverless Application Repository](https://serverlessrepo.aws.amazon.com/applications).
3. Fill out the parameters in the installation form:
   1. *AlarmTopicArn* - ARN of the SNS topic which receives the CloudWatch Alarms that you want to post in MS Teams.
   2. *MSTeamsWebhookUrl* - The URL of the incoming webhook that you copied from the channel connector in step 1.
4. Deploy the application.
