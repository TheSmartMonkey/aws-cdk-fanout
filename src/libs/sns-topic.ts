import { StackName } from '@/models/contruct.model';
import { aws_iam as iam, aws_sns as sns } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface SnsTopicConstructProps {
  stackName: StackName;
}

export class SnsTopicConstruct extends Construct {
  public readonly topic: sns.Topic;

  constructor(scope: Construct, id: string, props: SnsTopicConstructProps) {
    super(scope, id);

    // SNS topic
    this.topic = new sns.Topic(this, `${props.stackName}-topic`, {
      displayName: `${props.stackName}-topic`,
      topicName: `${props.stackName}-topic`,
    });

    new sns.TopicPolicy(this, `${props.stackName}-topic-policy`, {
      topics: [this.topic],
      policyDocument: new iam.PolicyDocument({
        statements: [
          new iam.PolicyStatement({
            actions: ['sns:Publish'],
            effect: iam.Effect.ALLOW,
            principals: [new iam.ServicePrincipal('apigateway.amazonaws.com')],
            resources: [this.topic.topicArn],
          }),
        ],
      }),
    });
  }
}
