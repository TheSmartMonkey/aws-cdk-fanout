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
 */
export type FanoutConstructProps = {
  stage: AwsStage;
  region: AwsRegion;
  sqsToLambda: SqsToLambdaPropsEntity[];
};
