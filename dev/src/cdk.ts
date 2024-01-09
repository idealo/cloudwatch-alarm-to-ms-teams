import {App} from 'aws-cdk-lib';
import {DevelopmentStack} from './development-stack';

const app = new App();
new DevelopmentStack(app, 'CloudWatchAlarmToMsTeamsDevelopment', getWebhookUrl(app), {
    env: {
        region: process.env.CDK_DEFAULT_REGION,
        account: process.env.CDK_DEFAULT_ACCOUNT,
    },
})


function getWebhookUrl(app: App): string {
    const url = app.node.tryGetContext('webhook-url');
    if (!url) {
        throw new Error('Webhook url not specified. Usage: npm run cdk-deploy -- -c webhook-url=https://you-webhook-url')
    }
    return url
}