import {Duration, Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import path from 'path';
import {NodejsFunction} from 'aws-cdk-lib/aws-lambda-nodejs';
import {Runtime} from 'aws-cdk-lib/aws-lambda';
import {Topic} from 'aws-cdk-lib/aws-sns';
import {SnsEventSource} from 'aws-cdk-lib/aws-lambda-event-sources';
import {Alarm, ComparisonOperator, TreatMissingData} from 'aws-cdk-lib/aws-cloudwatch';
import {SnsAction} from 'aws-cdk-lib/aws-cloudwatch-actions';

export class DevelopmentStack extends Stack {

    constructor(scope: Construct, private readonly id: string, private readonly webhookUrl: string, props: StackProps) {
        super(scope, id, props);
        const lambda = this.createLambdaFunction();
        const topic = this.createSnsTopic()
        lambda.addEventSource(new SnsEventSource(topic))

        const alarm = this.createTestAlarm(lambda);
        alarm.addAlarmAction(new SnsAction(topic));
        alarm.addOkAction(new SnsAction(topic));
        alarm.addInsufficientDataAction(new SnsAction(topic));
    }
    /**
     * A test alarm that becomes red if the notification lambda itself has not been executed at least once
     * during the last 5 minutes. This creates a flickering alarm that allows to evaluate the adaptive cards.
     */
    private createTestAlarm(lambda: NodejsFunction) {
        return new Alarm(this, 'TestAlarm', {
            actionsEnabled: true,
            alarmDescription: this.getAlarmDescription(),
            alarmName: '[TEST ALARM] CloudWatch To Ms Teams',
            comparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
            metric: lambda.metricInvocations({
                period: Duration.minutes(1)
            }),
            threshold: 1,
            evaluationPeriods: 5,
            datapointsToAlarm: 5,
            treatMissingData: TreatMissingData.BREACHING,
        })
    }

    private createSnsTopic(): Topic {
        return new Topic(this, 'Topic', {});
    }

    private createLambdaFunction() {
        const lambdaProjectRoot = path.join(__dirname, '../../');
        return new NodejsFunction(this, 'Lambda', {
            functionName: 'cloudwatch-alarm-to-ms-teams-dev',
            memorySize: 128,
            timeout: Duration.seconds(10),
            runtime: Runtime.NODEJS_20_X,
            handler: 'handler',
            depsLockFilePath: lambdaProjectRoot + '/package-lock.json',
            projectRoot: lambdaProjectRoot,
            entry: path.join(lambdaProjectRoot, '/src/handlers/forward-to-teams.ts'),
            environment: {
                TEAMS_WEBHOOK_URL: this.webhookUrl,
            },
            bundling: {
                tsconfig: lambdaProjectRoot + '/tsconfig.json',
            },
        });
    }

    private getAlarmDescription() {
        return `You receive this alarm because you deployed the DevelopmentStack of  
[idealo/cloudwatch-alarm-to-ms-teams](https://github.com/idealo/cloudwatch-alarm-to-ms-teams) to AWS account ${this.account}.  
To stop receiving these notifications, delete the CloudFormation stack \`${this.id}\``;
    }
}