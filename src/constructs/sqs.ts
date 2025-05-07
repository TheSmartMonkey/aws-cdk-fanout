import { StackName } from '@/models/contruct.model';
import { Duration } from 'aws-cdk-lib';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

export interface SqsConstructProps {
  readonly name: string;
  readonly stackName: StackName;
  readonly topic: sns.Topic;
  readonly lambdaFunction: NodejsFunction;
  readonly sqsFailureDlq: sqs.Queue;
  readonly snsFilter: {
    [attribute: string]: sns.FilterOrPolicy;
  };
  readonly maxBatchingWindow: Duration;
  readonly visibilityTimeout: Duration;
  readonly queueOptions?: sqs.QueueProps;
}

export class SqsConstruct extends Construct {
  public readonly queue: sqs.Queue;
  public readonly dlq: sqs.Queue;

  constructor(scope: Construct, id: string, props: SqsConstructProps) {
    super(scope, id);
    const { name, stackName, topic, sqsFailureDlq, snsFilter, queueOptions, visibilityTimeout, lambdaFunction, maxBatchingWindow } = props;
    const dlqName = `${stackName}-${name}-dlq`;
    const queueName = `${stackName}-${name}-queue`;

    // Dead Letter Queue
    this.dlq = new sqs.Queue(this, dlqName, {
      queueName: dlqName,
      retentionPeriod: Duration.days(14),
    });

    // SQS Queue
    this.queue = new sqs.Queue(this, queueName, {
      queueName,
      visibilityTimeout,
      deadLetterQueue: {
        queue: this.dlq,
        maxReceiveCount: 3,
      },
      ...queueOptions,
    });

    // Topic subscription
    topic.addSubscription(
      new subs.SqsSubscription(this.queue, {
        deadLetterQueue: sqsFailureDlq,
        filterPolicyWithMessageBody: snsFilter,
      }),
    );

    // Grant permissions and add event source
    this.queue.grantConsumeMessages(lambdaFunction);
    lambdaFunction.addEventSource(
      new SqsEventSource(this.queue, {
        // TODO: Pass as required argument
        batchSize: 100,
        reportBatchItemFailures: true,
        maxBatchingWindow,
      }),
    );
  }
}
