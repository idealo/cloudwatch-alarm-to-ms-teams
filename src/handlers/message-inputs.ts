export interface CloudwatchAlarmNotification {
  AlarmName: string;
  AlarmDescription: string;
  AWSAccountId: string;
  NewStateValue: CloudwatchAlarmState;
  NewStateReason: string;
  StateChangeTime: string;
  Region: string;
  AlarmArn: string;
  OldStateValue: CloudwatchAlarmState;
}

export enum CloudwatchAlarmState {
  OK = 'OK',
  ALARM = 'ALARM',
  INSUFFICIENT_DATA = 'INSUFFICIENT_DATA',
}

export function isCloudwatchAlarmNotification(
  x: any
): x is CloudwatchAlarmNotification {
  return x != null && x.AlarmName != null;
}
