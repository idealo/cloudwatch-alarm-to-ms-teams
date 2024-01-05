# Development and debugging setup for cloudwatch-alarm-to-ms-teams

This folder contains a small CDK stack that deploys the application's lambda function directly from source and connects a test alarm to it.
Useful for debugging or when working on the layout of the adaptive cards. 

> [!CAUTION]
>
> USE AT YOUR OWN RISK!
> Using this stack will incur cost. Created and used AWS resources are a lambda function, an associated IAM role
> a sns topic, a cloudwatch alarm and a CloudWatch LogGroup on execution
> HTTPS calls to the provided webhook URL will be made!
> 
> The setup uses minimal configuration. Never deploy to an AWS account with production workloads!

# Prerequisites

- Access to an AWS account with required permissions
  - The account needs to be [bootstrapped for CDK](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html).
  - if it isn't run `npx cdk bootstrap aws://ACCOUNT-NUMBER/REGION` with proper permissions to achieve that 
- node.js >=20 installed
- A Webhook URL for Microsoft Teams

# Usage

- Run `npm install` in this folder
- Deploy providing your webhook url by running `npm run cdk-deploy -- -c webhook-url=https://your-webhook-url`
- Late clean up by running `npm run cdk-destroy`

# What it does

- The cloudwatch-alarm-to-ms-teams [lambda function](../src/handlers) will be packaged and deployed directly from source
  - it will be parameterized with the provided webhook URL 
- A flickering CloudWatch alarm (switching between alarm and OK state every ~ 5 minutes) will be created that triggers the lambda via SNS
- If everything works, you'll get an adaptive card send to your Webhook URL almost immediately after deployment.

