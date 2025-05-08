import { ApiGatewayConstruct } from '@/constructs/api-gateway';
import { LambdaConstruct } from '@/constructs/lambda';
import { LambdaRoleConstruct } from '@/constructs/lambda-role';
import { SnsTopicConstruct } from '@/constructs/sns-topic';
import { SqsConstruct } from '@/constructs/sqs';
import { FanoutConstructPropsEntity } from '@/entities/fanout-construct-props.entity';
import { StackName } from '@/models/contruct.model';
import { Duration, aws_sns as sns } from 'aws-cdk-lib';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

/**
 * Fanout construct
 *
 * This construct creates a SNS topic and a API Gateway to receive webhook events and send them to the SNS topic.
 * It also creates a SQS queue to receive the messages from the SNS topic and a lambda function to process the messages.
 *
 * @param scope - The scope of the construct.
 * @param id - The id of the construct. Used to name the resources.
 * @param props - The props of the construct as a FanoutConstructPropsEntity.
 */
export class FanoutConstruct extends Construct {
  public readonly topic: sns.Topic;
  public readonly stackName: StackName;
  private lambdaRole?: LambdaRoleConstruct;

  constructor(scope: Construct, id: string, props: FanoutConstructPropsEntity) {
    super(scope, id);
    const { stage, sqsToLambda, removeApiGateway, removeApiGatewayKeyAuth, removeLambda } = props.value;
    // TODO: handle fifo queues
    const fifo = false;
    this.stackName = id;

    // Create SNS Topic
    const snsConstruct = new SnsTopicConstruct(this, `${this.stackName}-sns`, { stackName: this.stackName, fifo: fifo ?? false });
    this.topic = snsConstruct.topic;

    // Create API Gateway
    if (!removeApiGateway) {
      new ApiGatewayConstruct(this, `${this.stackName}-api`, {
        stackName: this.stackName,
        stage,
        snsTopic: this.topic,
        removeApiGatewayKeyAuth: removeApiGatewayKeyAuth ?? false,
        fifo: fifo ?? false,
      });
    }

    // Create SQS Failure DLQ
    const sqsFailureDlqName = fifo ? `${this.stackName}-sqs-failure-dlq.fifo` : `${this.stackName}-sqs-failure-dlq`;
    const sqsFailureDlq = new sqs.Queue(this, sqsFailureDlqName, {
      queueName: sqsFailureDlqName,
      retentionPeriod: Duration.days(14),
      fifo: fifo ?? false,
    });

    // Create Lambda Role
    if (!removeLambda) {
      this.lambdaRole = new LambdaRoleConstruct(this, `${this.stackName}-lambda-role`, {
        stackName: this.stackName,
      });
    }

    sqsToLambda.forEach((sqsToLambdaItem) => {
      const {
        lambdaName,
        handlerPath,
        envVars,
        lambdaOptions,
        snsFilter,
        queueOptions,
        sqsMaxBatchSize,
        sqsMaxBatchingWindow,
        sqsVisibilityTimeout,
      } = sqsToLambdaItem.value;

      let lambdaFunction: LambdaConstruct | undefined;
      if (!removeLambda) {
        lambdaFunction = new LambdaConstruct(this, `${this.stackName}-lambda-${lambdaName}`, {
          name: lambdaName,
          stackName: this.stackName,
          lambdaRole: this.lambdaRole!.role,
          handlerPath,
          envVars,
          lambdaOptions,
        });
      }

      new SqsConstruct(this, `${this.stackName}-sqs-queue-${lambdaName}`, {
        name: lambdaName,
        stackName: this.stackName,
        topic: this.topic,
        sqsFailureDlq,
        snsFilter,
        batchSize: sqsMaxBatchSize,
        maxBatchingWindow: sqsMaxBatchingWindow,
        visibilityTimeout: sqsVisibilityTimeout,
        lambdaFunction: lambdaFunction?.lambdaFunction,
        queueOptions,
      });
    });
  }
}
