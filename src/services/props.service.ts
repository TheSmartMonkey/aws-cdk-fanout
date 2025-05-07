import { FanoutConstructProps } from '@/functions/fanout';
import { FanoutConstructError } from '@/models/errors.model';

// TODO: Convert to FanoutConstructProps with validation in constructor
export class PropsService {
  private readonly props: FanoutConstructProps;

  constructor(props: FanoutConstructProps) {
    this.props = props;
  }

  public validate(): void {
    if (!this.props.stage) {
      throw new FanoutConstructError('STAGE_REQUIRED');
    }

    if (!this.props.stage.match(/^[a-zA-Z0-9-]+$/)) {
      throw new FanoutConstructError('STAGE_MUST_CONTAIN_ONLY_ALPHANUMERIC_CHARACTERS_AND_HYPHENS');
    }

    if (!this.props.region) {
      throw new FanoutConstructError('REGION_REQUIRED');
    }

    // region is already type-safe due to AwsRegion type, but we can add additional validation if needed
    if (this.props.stage.length > 32) {
      throw new FanoutConstructError('STAGE_NAME_CANNOT_EXCEED_32_CHARACTERS');
    }
  }
}
