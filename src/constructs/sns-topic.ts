import { StackName } from '@/models/contruct.model';
import { aws_iam as iam, aws_sns as sns } from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface SnsTopicConstructProps {
  readonly stackName: StackName;
}

export class SnsTopicConstruct extends Construct {
  public readonly topic: sns.Topic;

  constructor(scope: Construct, id: string, props: SnsTopicConstructProps) {
    super(scope, id);
    const { stackName } = props;
    const topicName = `${stackName}-topic`;

    // SNS topic
    this.topic = new sns.Topic(this, topicName, {
      displayName: topicName,
      topicName,
    });

    new sns.TopicPolicy(this, `${stackName}-topic-policy`, {
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
