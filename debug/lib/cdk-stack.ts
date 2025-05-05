import { SnsTopicConstruct } from 'aws-cdk-fanout';
import { App, Stack, StackProps } from 'aws-cdk-lib';

interface MyStackProps extends StackProps {
  stage: string;
  region: string;
}

export function createCdkStack(app: App, id: string, props: MyStackProps): Stack {
  const stack = new Stack(app, id, props);

  // SNS topic
  const topic = new SnsTopicConstruct(stack, 'SnsTopicConstruct');

  return stack;
}
