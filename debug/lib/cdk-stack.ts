import { AwsRegion, AwsStage, FanoutConstruct, FanoutConstructPropsEntity, SqsToLambdaPropsEntity } from 'aws-cdk-fanout';
import { App, Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as path from 'path';

interface MyStackProps extends StackProps {
  stage: AwsStage;
  region: AwsRegion;
}

export function createCdkStack(app: App, id: string, props: MyStackProps): Stack {
  const stack = new Stack(app, id, props);

  const fanoutConstructProps = new FanoutConstructPropsEntity({
    stage: props.stage,
    region: props.region,
    sqsToLambda: [
      new SqsToLambdaPropsEntity({
        snsFilter: {
          eventType: snsFiltersIncludes(['send']),
        },
        envVars: {},
        handlerPath: path.join(__dirname, 'handler.ts'),
        lambdaName: 'send-event',
        sqsMaxBatchSize: 10,
        sqsVisibilityTimeout: Duration.seconds(30),
        sqsMaxBatchingWindow: Duration.seconds(10),
      }),
      new SqsToLambdaPropsEntity({
        snsFilter: {
          eventType: snsFiltersIncludes(['receive']),
        },
        envVars: {},
        handlerPath: path.join(__dirname, 'handler.ts'),
        lambdaName: 'receive-event',
        sqsMaxBatchSize: 10,
        sqsVisibilityTimeout: Duration.seconds(30),
        sqsMaxBatchingWindow: Duration.seconds(10),
      }),
    ],
  });

  new FanoutConstruct(stack, id, fanoutConstructProps);

  return stack;
}

export function snsFiltersIncludes(allowlist: string[]) {
  return sns.FilterOrPolicy.filter(sns.SubscriptionFilter.stringFilter({ allowlist }));
}
