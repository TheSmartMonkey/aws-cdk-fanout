import { FanoutConstructError } from '@/models/errors.model';
import { AwsRegion, AwsStage } from '@/models/public.model';
import { SqsToLambdaPropsEntity } from './sqs-to-lambda-props.entity';

export class FanoutConstructPropsEntity {
  constructor(private readonly props: FanoutConstructProps) {
    if (this.props.stage.length > 32) {
      throw new FanoutConstructError('STAGE_NAME_CANNOT_EXCEED_32_CHARACTERS');
    }
  }

  public get value(): FanoutConstructProps {
    return this.props;
  }
}

/**
 * @description FanoutConstructProps is the properties for the FanoutConstruct construct.
 * @property stage - The stage of the construct.
 * @property region - The region of the construct.
 * @property sqsToLambda - The SQS to Lambda mappings for the construct.
 * @property removeApiGateway - Whether to remove the API Gateway (default: false).
 * @property removeApiGatewayKeyAuth - Whether to remove the API Gateway key auth (default: false).
 * @property removeLambda - Whether to remove the Lambda function (default: false).
 */
export type FanoutConstructProps = {
  /**
   * The stage of the construct.
   * @example 'dev'
   */
  stage: AwsStage;
  /**
   * The region of the construct.
   * @example 'us-east-1'
   */
  region: AwsRegion;
  /**
   * The SQS to Lambda mappings for the construct.
   */
  sqsToLambda: SqsToLambdaPropsEntity[];
  /**
   * Whether to remove the API Gateway (default: false).
   * @default false
   */
  removeApiGateway?: boolean;
  /**
   * Whether to remove the API Gateway key auth (default: false).
   * @default false
   */
  removeApiGatewayKeyAuth?: boolean;
  /**
   * Whether to remove the Lambda function (default: false).
   * @default false
   * TODO: put this in the sqsToLambda array
   */
  removeLambda?: boolean;
};
