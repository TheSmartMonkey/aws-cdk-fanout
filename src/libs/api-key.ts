import { StackName } from '@/models/contruct.model';
import { aws_apigateway as apigateway } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface ApiKeyConstructProps {
  stackName: StackName;
  api: apigateway.RestApi;
}

export class ApiKeyConstruct extends Construct {
  public readonly apiKey: apigateway.ApiKey;
  public readonly usagePlan: apigateway.UsagePlan;

  constructor(scope: Construct, id: string, props: ApiKeyConstructProps) {
    super(scope, id);

    // Create API Key
    this.apiKey = new apigateway.ApiKey(this, `${props.stackName}-api-key`);

    // Create Usage Plan
    this.usagePlan = new apigateway.UsagePlan(this, `${props.stackName}-api-usage-plan`, {
      name: 'Usage Plan',
      apiStages: [
        {
          api: props.api,
          stage: props.api.deploymentStage,
        },
      ],
    });

    // Add API Key to Usage Plan
    this.usagePlan.addApiKey(this.apiKey);
  }
}
