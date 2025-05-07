import { StackName } from '@/models/contruct.model';
import { Duration, aws_sns as sns, aws_sqs as sqs, aws_sns_subscriptions as subs } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface SqsQueueConstructProps {
  stackName: StackName;
  snsTopic: sns.Topic;
}

export class SqsQueuesConstruct extends Construct {
  public readonly queue: sqs.Queue;

  constructor(scope: Construct, id: string, props: SqsQueueConstructProps) {
    super(scope, id);

    // SQS Queue
    this.queue = new sqs.Queue(this, `${props.stackName}-queue`, {
      queueName: `${props.stackName}-queue`,
      visibilityTimeout: Duration.minutes(15),
      // You can uncomment and configure these options as needed
      // deadLetterQueue: {
      //   queue: dlq,
      //   maxReceiveCount: 3,
      // },
    });

    // Topic subscription
    props.snsTopic.addSubscription(
      new subs.SqsSubscription(this.queue, {
        // You can uncomment and configure these options as needed
        // deadLetterQueue: sqsFailureDlq,
        // filterPolicyWithMessageBody: snsFilter,
      }),
    );
  }
}
