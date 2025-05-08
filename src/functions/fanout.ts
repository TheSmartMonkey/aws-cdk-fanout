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

  constructor(scope: Construct, id: string, props: FanoutConstructPropsEntity) {
    super(scope, id);
    // const { snsFilter, queueOptions, sqsMaxBatchingWindow, sqsVisibilityTimeout, lambdaOptions, envVars, handlerPath, lambdaName } =
    //   props.value;
    const { stage, sqsToLambda } = props.value;
    this.stackName = id;

    // Create SNS Topic
    const snsConstruct = new SnsTopicConstruct(this, `${this.stackName}-sns`, { stackName: this.stackName });
    this.topic = snsConstruct.topic;

    // Create API Gateway
    new ApiGatewayConstruct(this, `${this.stackName}-api`, {
      stackName: this.stackName,
      stage,
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
      const lambdaFunction = new LambdaConstruct(this, `${this.stackName}-lambda-${lambdaName}`, {
        name: lambdaName,
        stackName: this.stackName,
        lambdaRole: lambdaRole.role,
        handlerPath,
        envVars,
        lambdaOptions,
      });

      new SqsConstruct(this, `${this.stackName}-sqs-queue-${lambdaName}`, {
        name: lambdaName,
        stackName: this.stackName,
        topic: this.topic,
        lambdaFunction: lambdaFunction.lambdaFunction,
        sqsFailureDlq,
        snsFilter,
        queueOptions,
        batchSize: sqsMaxBatchSize,
        maxBatchingWindow: sqsMaxBatchingWindow,
        visibilityTimeout: sqsVisibilityTimeout,
      });
    });
  }
}
