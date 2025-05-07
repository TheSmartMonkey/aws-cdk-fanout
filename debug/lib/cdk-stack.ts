import { AwsRegion, AwsStage, FanoutConstruct } from 'aws-cdk-fanout';
import { App, Stack, StackProps } from 'aws-cdk-lib';

interface MyStackProps extends StackProps {
  stage: AwsStage;
  region: AwsRegion;
}

export function createCdkStack(app: App, id: string, props: MyStackProps): Stack {
  const stack = new Stack(app, id, props);

  // SNS topic
  const fanout = new FanoutConstruct(stack, 'FanoutConstruct', {
    stage: props.stage,
    region: props.region,
  });

  return stack;
}
