import {
  aws_apigateway as apigateway,
  Duration,
  aws_iam as iam,
  aws_sns as sns,
  aws_sqs as sqs,
  aws_sns_subscriptions as subs,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface FanoutConstructProps {
  stage: string;
  region: string;
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

    // SNS topic
    this.topic = new sns.Topic(this, `${id}-topic`, {
      displayName: `${id}-topic`,
      topicName: `${id}-topic`,
    });

    new sns.TopicPolicy(this, `${id}-topic-policy`, {
      topics: [this.topic],
      policyDocument: new iam.PolicyDocument({
        statements: [
          new iam.PolicyStatement({
            actions: ['sns:Publish'],
            effect: iam.Effect.ALLOW,
            principals: [new iam.ServicePrincipal('apigateway.amazonaws.com')],
            resources: [this.topic.topicArn],
          }),
        ],
      }),
    });

    // Create API Gateway
    const api = new apigateway.RestApi(this, `${id}-api`, {
      restApiName: `${id}-api`,
      description: 'This service receives webhook events and sends them to SNS',
      deployOptions: {
        stageName: props.stage,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
      apiKeySourceType: apigateway.ApiKeySourceType.HEADER,
    });

    // Create our API Key
    const apiKey = new apigateway.ApiKey(this, `${id}-api-key`);
    const usagePlan = new apigateway.UsagePlan(this, `${id}-api-usage-plan`, {
      name: 'Usage Plan',
      apiStages: [
        {
          api,

          stage: api.deploymentStage,
        },
      ],
    });
    usagePlan.addApiKey(apiKey);

    // Create API Gateway resource and method
    const sendEventApiGatewayResource = api.root.addResource('send-event');
    const apiGatewayRole = new iam.Role(this, `${id}-api-gateway-role`, {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
    });

    apiGatewayRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['sns:Publish'],
        resources: [this.topic.topicArn],
      }),
    );

    const apiIntegration = new apigateway.AwsIntegration({
      service: 'sns',
      action: 'Publish',
      integrationHttpMethod: 'POST',
      options: {
        credentialsRole: apiGatewayRole,
        requestParameters: {
          'integration.request.header.Content-Type': "'application/x-www-form-urlencoded'",
        },
        requestTemplates: {
          'application/json': `Action=Publish&TopicArn=$util.urlEncode('${this.topic.topicArn}')&Message=$util.urlEncode($input.body)`,
          'application/x-www-form-urlencoded': `Action=Publish&TopicArn=$util.urlEncode('${this.topic.topicArn}')&Message=$util.urlEncode($input.body)`,
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
      apiKeyRequired: true,
    });

    // Grant permissions to API Gateway to publish to SNS
    this.topic.grantPublish(apiGatewayRole);

    // SQS Queues
    const queue = new sqs.Queue(this, `${id}-queue`, {
      queueName: `${id}-queue`,
      visibilityTimeout: Duration.minutes(15),
      // deadLetterQueue: {
      //   queue: dlq,
      //   maxReceiveCount: 3,
      // },
      // ...queueOptions,
    });

    // Topic subscription
    this.topic.addSubscription(
      new subs.SqsSubscription(queue, {
        // deadLetterQueue: sqsFailureDlq,
        // filterPolicyWithMessageBody: snsFilter,
      }),
    );

    // const lambdaRole = createLambdaRoles(this);
    // addNewQueues({ stack, topic, sqsFailureDlq, lambdaRole, dotEnv: props.dotEnv, ssmEnv: props.ssmEnv });

    // return stack;
  }
}
