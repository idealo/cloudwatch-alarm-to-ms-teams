import { SNSHandler } from 'aws-lambda';
import { IncomingWebhook } from 'ms-teams-webhook';
import {
  CloudwatchAlarmState,
  isCloudwatchAlarmNotification,
} from './message-inputs';
import * as arnParser from '@aws-sdk/util-arn-parser';
import * as log from 'lambda-log';
import { formatISO, parseISO } from 'date-fns';

export const handler: SNSHandler = async (event) => {
  const webhookUrl = process.env.TEAMS_WEBHOOK_URL;
  if (webhookUrl == undefined) {
    throw new Error('TEAMS_WEBHOOK_URL must be defined');
  }

  console.log(JSON.stringify(event));

  const webhook = new IncomingWebhook(webhookUrl);

  for (const record of event.Records) {
    const message = JSON.parse(record.Sns.Message);
    if (!isCloudwatchAlarmNotification(message)) {
      log.warn('Ignoring non-alarm message', message);
      continue;
    }

    const stateChangeTime = parseISO(message.StateChangeTime);

    await webhook.send({
      type: 'message',
      attachments: [
        {
          contentType: 'application/vnd.microsoft.card.adaptive',
          contentUrl: null,
          content: {
            $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
            type: 'AdaptiveCard',
            version: '1.3',
            body: [
              {
                type: 'Container',
                padding: 'None',
                items: [
                  {
                    type: 'TextBlock',
                    wrap: true,
                    size: 'Large',
                    color: getHeadingColor(message.NewStateValue),
                    text: `${getEmoji(message.NewStateValue)} ${
                      message.NewStateValue
                    }: ${message.AlarmName}`,
                  },
                ],
              },
              {
                type: 'Container',
                items: [
                  {
                    type: 'TextBlock',
                    text: message.AlarmDescription,
                    wrap: true,
                  },
                  {
                    type: 'TextBlock',
                    text: message.NewStateReason,
                    wrap: true,
                  },
                ],
                isVisible: false,
                id: 'alarm-details',
              },
              {
                type: 'Container',
                padding: 'None',
                items: [
                  {
                    type: 'ColumnSet',
                    columns: [
                      {
                        type: 'Column',
                        width: 'stretch',
                        items: [
                          {
                            type: 'TextBlock',
                            text: 'Account',
                            wrap: true,
                            isSubtle: true,
                            weight: 'Bolder',
                          },
                          {
                            type: 'TextBlock',
                            wrap: true,
                            spacing: 'Small',
                            text: message.AWSAccountId,
                          },
                        ],
                      },
                      {
                        type: 'Column',
                        width: 'stretch',
                        items: [
                          {
                            type: 'TextBlock',
                            text: 'Region',
                            wrap: true,
                            isSubtle: true,
                            weight: 'Bolder',
                          },
                          {
                            type: 'TextBlock',
                            text: message.Region,
                            wrap: true,
                            spacing: 'Small',
                          },
                        ],
                      },
                      {
                        type: 'Column',
                        width: 'stretch',
                        items: [
                          {
                            type: 'TextBlock',
                            text: 'Time',
                            wrap: true,
                            weight: 'Bolder',
                            isSubtle: true,
                          },
                          {
                            type: 'TextBlock',
                            text: `{{TIME(${formatISO(stateChangeTime)})}}`,
                            wrap: true,
                            spacing: 'Small',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
            padding: 'None',
            actions: [
              {
                type: 'Action.ToggleVisibility',
                title: 'Show Details',
                targetElements: ['alarm-details'],
              },
              {
                type: 'Action.OpenUrl',
                title: 'View in CloudWatch',
                url: getAlarmLink(message.AlarmArn),
              },
            ],
          },
        },
      ],
    });
  }
};

function getAlarmLink(alarmArn: string) {
  const arn = arnParser.parse(alarmArn);
  return `https://${arn.region}.console.aws.amazon.com/cloudwatch/home?region=${
    arn.region
  }#s=Alarms&alarm=${arn.resource.split(':')[1]}`;
}

function getHeadingColor(state: CloudwatchAlarmState): string {
  switch (state) {
    case CloudwatchAlarmState.OK:
      return 'Good';
    case CloudwatchAlarmState.ALARM:
      return 'Attention';
    case CloudwatchAlarmState.INSUFFICIENT_DATA:
      return 'Warning';
  }
}

function getEmoji(state: CloudwatchAlarmState): string {
  switch (state) {
    case CloudwatchAlarmState.OK:
      return '✅';
    case CloudwatchAlarmState.ALARM:
      return '🚨';
    case CloudwatchAlarmState.INSUFFICIENT_DATA:
      return '⚠️';
  }
}
