import { StackName } from '@/models/contruct.model';
import { AwsStage } from '@/models/public.model';
import { aws_apigateway as apigateway, aws_iam as iam, aws_sns as sns } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApiKeyConstruct } from './api-key';

interface ApiGatewayConstructProps {
  readonly stackName: StackName;
  readonly stage: AwsStage;
  readonly snsTopic: sns.Topic;
  readonly removeApiGatewayKeyAuth: boolean;
}

export class ApiGatewayConstruct extends Construct {
  public readonly api: apigateway.RestApi;
  public readonly apiGatewayRole: iam.Role;

  constructor(scope: Construct, id: string, props: ApiGatewayConstructProps) {
    super(scope, id);
    const { stackName, stage, snsTopic, removeApiGatewayKeyAuth } = props;

    // Create API Gateway
    this.api = new apigateway.RestApi(this, `${stackName}-api`, {
      restApiName: `${stackName}-api`,
      description: 'This service receives webhook events and sends them to SNS',
      deployOptions: {
        stageName: stage,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
      apiKeySourceType: removeApiGatewayKeyAuth ? undefined : apigateway.ApiKeySourceType.HEADER,
    });

    // Create API Key using the new construct
    if (!removeApiGatewayKeyAuth) {
      new ApiKeyConstruct(this, `${stackName}-api-key`, {
        stackName,
        api: this.api,
      });
    }

    // Create API Gateway resource and method
    const sendEventApiGatewayResource = this.api.root.addResource('send-event');
    this.apiGatewayRole = new iam.Role(this, `${stackName}-api-gateway-role`, {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
    });

    this.apiGatewayRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['sns:Publish'],
        resources: [snsTopic.topicArn],
      }),
    );

    const apiIntegration = new apigateway.AwsIntegration({
      service: 'sns',
      action: 'Publish',
      integrationHttpMethod: 'POST',
      options: {
        credentialsRole: this.apiGatewayRole,
        requestParameters: {
          'integration.request.header.Content-Type': "'application/x-www-form-urlencoded'",
        },
        requestTemplates: {
          'application/json': `Action=Publish&TopicArn=$util.urlEncode('${snsTopic.topicArn}')&Message=$util.urlEncode($input.body)`,
          'application/x-www-form-urlencoded': `Action=Publish&TopicArn=$util.urlEncode('${snsTopic.topicArn}')&Message=$util.urlEncode($input.body)`,
        },
        integrationResponses: [
          {
            statusCode: '200',
            responseTemplates: {
              'application/json': JSON.stringify({
                message: 'Message sent to SNS topic',
                requestId: '$context.requestId',
              }),
            },
          },
          {
            selectionPattern: '4\\d{2}',
            statusCode: '400',
            responseTemplates: {
              'application/json': JSON.stringify({
                message: 'Invalid request',
                errorType: "$util.escapeJavaScript($input.path('$.errorType'))",
                errorMessage: "$util.escapeJavaScript($input.path('$.errorMessage'))",
                requestId: '$context.requestId',
              }),
            },
          },
          {
            selectionPattern: '5\\d{2}',
            statusCode: '500',
            responseTemplates: {
              'application/json': JSON.stringify({
                message: 'Internal server error',
                errorType: "$util.escapeJavaScript($input.path('$.errorType'))",
                errorMessage: "$util.escapeJavaScript($input.path('$.errorMessage'))",
                requestId: '$context.requestId',
              }),
            },
          },
        ],
      },
    });

    sendEventApiGatewayResource.addMethod('POST', apiIntegration, {
      methodResponses: [{ statusCode: '200' }, { statusCode: '400' }, { statusCode: '500' }],
      apiKeyRequired: !removeApiGatewayKeyAuth,
    });

    // Grant permissions to API Gateway to publish to SNS
    snsTopic.grantPublish(this.apiGatewayRole);
  }
}
