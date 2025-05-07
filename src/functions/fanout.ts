import { AwsRegion, AwsStage, StackName } from '@/models/contruct.model';
import { FanoutConstructError } from '@/models/errors.model';
import { aws_sns as sns } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApiGatewayConstruct } from '../libs/api-gateway';
import { SnsTopicConstruct } from '../libs/sns-topic';
import { SqsQueuesConstruct } from '../libs/sqs-queues';

export interface FanoutConstructProps {
  stage: AwsStage;
  region: AwsRegion;
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
 */
export class FanoutConstruct extends Construct {
  public readonly topic: sns.Topic;

  constructor(scope: Construct, id: string, props: FanoutConstructProps) {
    super(scope, id);

    // Validate props
    this.validateProps(props);

    const stackName: StackName = `${props.stage}-${id}`;

    // Create SNS Topic
    const snsConstruct = new SnsTopicConstruct(this, `${stackName}-sns`, { stackName });
    this.topic = snsConstruct.topic;

    // Create API Gateway
    new ApiGatewayConstruct(this, `${stackName}-api`, {
      stackName,
      stage: props.stage,
      snsTopic: this.topic,
    });

    // Create SQS Queue (this also creates the SNS subscription)
    new SqsQueuesConstruct(this, `${stackName}-sqs`, {
      stackName,
      snsTopic: this.topic,
    });
  }

  private validateProps(props: FanoutConstructProps): void {
    if (!props.stage) {
      throw new FanoutConstructError('STAGE_REQUIRED');
    }

    if (!props.stage.match(/^[a-zA-Z0-9-]+$/)) {
      throw new FanoutConstructError('STAGE_MUST_CONTAIN_ONLY_ALPHANUMERIC_CHARACTERS_AND_HYPHENS');
    }

    if (!props.region) {
      throw new FanoutConstructError('REGION_REQUIRED');
    }

    // region is already type-safe due to AwsRegion type, but we can add additional validation if needed
    if (props.stage.length > 32) {
      throw new FanoutConstructError('STAGE_NAME_CANNOT_EXCEED_32_CHARACTERS');
    }
  }
}
