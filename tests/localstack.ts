import { FanoutConstruct, FanoutConstructPropsEntity, SqsToLambdaPropsEntity } from '@/index';
import { LocalstackContainer, StartedLocalStackContainer } from '@testcontainers/localstack';
import { App, Duration, Stack } from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as path from 'path';
import { AWS_REGION, LOCALSTACK_PORT } from './helpers';

export class LocalStackClient {
  private static instance?: LocalStackClient;
  private readonly localstackContainer: StartedLocalStackContainer;

  private constructor(container: StartedLocalStackContainer) {
    this.localstackContainer = container;
  }

  public static async getInstance(): Promise<LocalStackClient> {
    if (!LocalStackClient.instance) {
      console.log('🚀 Starting LocalStack container...');
      const container = await new LocalstackContainer('localstack/localstack:3').withExposedPorts(LOCALSTACK_PORT).start();
      console.log(`🚀 LocalStack started at: ${container.getConnectionUri()} !`);

      LocalStackClient.instance = new LocalStackClient(container);
    }
    return LocalStackClient.instance;
  }

  public async initStack(): Promise<void> {
    console.log('🔧 Initializing stack...');
    const app = new App();
    const stack = new Stack(app, 'test-stack');

    const fanoutConstructProps = new FanoutConstructPropsEntity({
      stage: 'test',
      region: AWS_REGION,
      removeLambda: true,
      sqsToLambda: [
        new SqsToLambdaPropsEntity({
          snsFilter: {
            eventType: this.snsFiltersIncludes(['send']),
          },
          envVars: {},
          handlerPath: path.join(__dirname, 'handler.ts'),
          lambdaName: 'send-event',
          sqsMaxBatchSize: 10,
          sqsVisibilityTimeout: Duration.seconds(30),
          sqsMaxBatchingWindow: Duration.seconds(10),
        }),
        new SqsToLambdaPropsEntity({
          snsFilter: {
            eventType: this.snsFiltersIncludes(['receive']),
          },
          envVars: {},
          handlerPath: path.join(__dirname, 'handler.ts'),
          lambdaName: 'receive-event',
          sqsMaxBatchSize: 10,
          sqsVisibilityTimeout: Duration.seconds(30),
          sqsMaxBatchingWindow: Duration.seconds(10),
        }),
      ],
    });

    new FanoutConstruct(stack, 'test-fanout', fanoutConstructProps);
    console.log('🔧 Stack is ready !');
  }

  public async stop(): Promise<void> {
    if (!this.localstackContainer) {
      console.log('❌ No LocalStack container to stop !');
      return;
    }
    console.log('🧹 Stopping LocalStack container...');
    await this.localstackContainer.stop();
    LocalStackClient.instance = undefined;
    console.log('🧹 LocalStack container stopped !');
  }

  private snsFiltersIncludes(allowlist: string[]): sns.FilterOrPolicy {
    return sns.FilterOrPolicy.filter(sns.SubscriptionFilter.stringFilter({ allowlist }));
  }
}
