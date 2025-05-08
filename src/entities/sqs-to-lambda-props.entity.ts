import { FanoutConstructError } from '@/models/errors.model';
import { Duration } from 'aws-cdk-lib';
import { NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as sqs from 'aws-cdk-lib/aws-sqs';

export class SqsToLambdaPropsEntity {
  private readonly MAX_BATCH_SIZE: number = 10000;
  private readonly MAX_BATCHING_WINDOW: Duration = Duration.seconds(300); // 5 minutes
  private readonly MAX_VISIBILITY_TIMEOUT: Duration = Duration.seconds(43200); // 12 hours

  constructor(private readonly props: SqsToLambdaProps) {
    if (this.props.sqsMaxBatchSize < 1 || this.props.sqsMaxBatchSize > this.MAX_BATCH_SIZE) {
      throw new FanoutConstructError('SQS_MAX_BATCH_SIZE_INVALID');
    }

    if (
      this.props.sqsMaxBatchingWindow.toSeconds() < 0 ||
      this.props.sqsMaxBatchingWindow.toSeconds() > this.MAX_BATCHING_WINDOW.toSeconds()
    ) {
      throw new FanoutConstructError('SQS_MAX_BATCHING_WINDOW_INVALID');
    }

    if (
      this.props.sqsVisibilityTimeout.toSeconds() < 0 ||
      this.props.sqsVisibilityTimeout.toSeconds() > this.MAX_VISIBILITY_TIMEOUT.toSeconds()
    ) {
      throw new FanoutConstructError('SQS_VISIBILITY_TIMEOUT_INVALID');
    }
  }

  public get value(): SqsToLambdaProps {
    return this.props;
  }
}

/**
 * @description SqsToLambdaProps is the properties for the SqsToLambda construct.
 *
 * @property snsFilter - The SNS filter for the SNS topic.
 * @property envVars - The environment variables for the Lambda function.
 * @property handlerPath - The path to the handler for the Lambda function.
 * @property lambdaName - The name of the Lambda function.
 * @property sqsMaxBatchSize - The maximum batch size for the SQS queue (1-10000 messages).
 * @property sqsMaxBatchingWindow - The maximum batching window for the SQS queue (0-5 minutes).
 * @property sqsVisibilityTimeout - The visibility timeout for the SQS queue (0-12 hours).
 * @property queueOptions - To override the default options for the SQS queue.
 * @property lambdaOptions - To override the default options for the Lambda function.
 */
export type SqsToLambdaProps = {
  /**
   * The SNS filter for the SNS topic.
   * @example { eventType: sns.FilterOrPolicy }
   */
  snsFilter: {
    [attribute: string]: sns.FilterOrPolicy;
  };
  /**
   * The environment variables for the Lambda function.
   * @example { key: 'value' }
   */
  envVars: Record<string, string>;
  /**
   * The path to the handler for the Lambda function.
   * @example 'path/to/handler'
   */
  handlerPath: string;
  /**
   * The name of the Lambda function.
   * @example 'lambdaFunctionName'
   */
  lambdaName: string;
  /**
   * The maximum batch size for the SQS queue (1-10000 messages).
   * @example 10
   */
  sqsMaxBatchSize: number;
  /**
   * The visibility timeout for the SQS queue (0-12 hours).
   * @example Duration.seconds(90)
   */
  sqsVisibilityTimeout: Duration;
  /**
   * The maximum batching window for the SQS queue (0-5 minutes).
   * @example Duration.seconds(10)
   */
  sqsMaxBatchingWindow: Duration;
  /**
   * To override the default options for the SQS queue.
   * @optional
   */
  queueOptions?: sqs.QueueProps;
  /**
   * To override the default options for the Lambda function.
   * @optional
   */
  lambdaOptions?: NodejsFunctionProps;
};
