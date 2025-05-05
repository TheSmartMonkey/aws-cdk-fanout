import { App, Stack, StackProps } from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';

interface MyStackProps extends StackProps {
  stage: string;
  region: string;
}

export function createCdkStack(app: App, id: string, props: MyStackProps): Stack {
  const stack = new Stack(app, id, props);

  // SNS topic
  const topic = new sns.Topic(stack, `${stack.stackName}-topic`, {
    displayName: `${stack.stackName}-topic`,
    topicName: `${stack.stackName}-topic`,
  });

  return stack;
}
