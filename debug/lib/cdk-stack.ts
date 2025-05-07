import { AwsRegion, AwsStage, FanoutConstruct } from 'aws-cdk-fanout';
import { App, Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as path from 'path';

interface MyStackProps extends StackProps {
  stage: AwsStage;
  region: AwsRegion;
}

export function createCdkStack(app: App, id: string, props: MyStackProps): Stack {
  const stack = new Stack(app, id, props);

  // SNS topic
  new FanoutConstruct(stack, id, {
    stage: props.stage,
    region: props.region,
    snsFilter: {
      eventType: snsFiltersIncludes(['send', 'receive']),
    },
    envVars: {},
    handlerPath: path.join(__dirname, 'handler.ts'),
    lambdaName: 'fanout',
    sqsMaxBatchingWindow: Duration.seconds(5),
    sqsVisibilityTimeout: Duration.seconds(20),
    queueOptions: {},
    lambdaOptions: {},
  });

  return stack;
}

export function snsFiltersIncludes(allowlist: string[]) {
  return sns.FilterOrPolicy.filter(sns.SubscriptionFilter.stringFilter({ allowlist }));
}
