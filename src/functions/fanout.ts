import { LambdaConstruct } from '@/constructs/lambda';
import { LambdaRoleConstruct } from '@/constructs/lambda-role';
import { StackName } from '@/models/contruct.model';
import { AwsRegion, AwsStage } from '@/models/public.model';
import { PropsService } from '@/services/props.service';
import { Duration, aws_sns as sns } from 'aws-cdk-lib';
import { NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import { ApiGatewayConstruct } from '../constructs/api-gateway';
import { SnsTopicConstruct } from '../constructs/sns-topic';
import { SqsConstruct } from '../constructs/sqs';

export interface FanoutConstructProps {
  readonly stage: AwsStage;
  readonly region: AwsRegion;
  readonly snsFilter: {
    [attribute: string]: sns.FilterOrPolicy;
  };
  readonly envVars: Record<string, string>;
  readonly handlerPath: string;
  readonly lambdaName: string;
  readonly sqsMaxBatchingWindow: Duration;
  readonly sqsVisibilityTimeout: Duration;
  readonly queueOptions?: sqs.QueueProps;
  readonly lambdaOptions?: NodejsFunctionProps;
}

/**
 * Fanout construct
 *
 * This construct creates a SNS topic and a API Gateway to receive webhook events and send them to the SNS topic.
 * It also creates a SQS queue to receive the messages from the SNS topic and a lambda function to process the messages.
 *
 * @param scope - The scope of the construct.
 * @param id - The id of the construct. Used to name the resources.
 * @param props.stage - Your aws stage.
 * @param props.region - Your aws region eu-west-1, eu-west-2, etc.
 * @param props.snsFilter - The filter for the SNS topic.
 * @param props.envVars - The environment variables for the lambda function.
 * @param props.sqsMaxBatchingWindow - The max batching window for the SQS queue.
 * @param props.sqsVisibilityTimeout - The visibility timeout for the SQS queue.
 * @param props.queueOptions - The options for the SQS queue.
 * @param props.lambdaOptions - The options for the lambda function.
 */
export class FanoutConstruct extends Construct {
  public readonly topic: sns.Topic;
  public readonly stackName: StackName;

  constructor(scope: Construct, id: string, props: FanoutConstructProps) {
    super(scope, id);
    const { snsFilter, queueOptions, sqsMaxBatchingWindow, sqsVisibilityTimeout, lambdaOptions, envVars, handlerPath, lambdaName } = props;
    this.stackName = id;

    // Validate props
    const propsService = new PropsService(props);
    propsService.validate();

    // Create SNS Topic
    const snsConstruct = new SnsTopicConstruct(this, `${this.stackName}-sns`, { stackName: this.stackName });
    this.topic = snsConstruct.topic;

    // Create API Gateway
    new ApiGatewayConstruct(this, `${this.stackName}-api`, {
      stackName: this.stackName,
      stage: props.stage,
      snsTopic: this.topic,
    });

    // Create SQS Failure DLQ
    const sqsFailureDlq = new sqs.Queue(this, `${this.stackName}-sqs-failure-dlq`, {
      queueName: `${this.stackName}-sqs-failure-dlq`,
      retentionPeriod: Duration.days(14),
    });

    // Create Lambda Role
    const lambdaRole = new LambdaRoleConstruct(this, `${this.stackName}-lambda-role`, {
      stackName: this.stackName,
    });

    // Create Lambda Function
    const lambdaFunction = new LambdaConstruct(this, `${this.stackName}-lambda`, {
      name: lambdaName,
      stackName: this.stackName,
      lambdaRole: lambdaRole.role,
      handlerPath,
      envVars,
      lambdaOptions,
    });

    new SqsConstruct(this, `${this.stackName}-sqs-queue`, {
      name: lambdaName,
      stackName: this.stackName,
      topic: this.topic,
      lambdaFunction: lambdaFunction.lambdaFunction,
      sqsFailureDlq,
      snsFilter,
      queueOptions,
      maxBatchingWindow: sqsMaxBatchingWindow,
      visibilityTimeout: sqsVisibilityTimeout,
    });
  }
}
