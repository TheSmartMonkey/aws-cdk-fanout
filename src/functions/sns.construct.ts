import { aws_sns as sns } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class SnsTopicConstruct extends Construct {
  public readonly topic: sns.Topic;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.topic = new sns.Topic(this, `${id}-topic2`, {
      displayName: `${id}-topic2`,
      topicName: `${id}-topic2`,
    });
  }
}
