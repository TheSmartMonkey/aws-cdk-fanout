import { CreateQueueCommand } from '@aws-sdk/client-sqs';
import { LocalstackContainer, StartedLocalStackContainer } from '@testcontainers/localstack';
import { LOCALSTACK_PORT } from './helpers';
import { initSqs, QUEUE_NAME } from './sqs';

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
    const sqsClient = initSqs(this.localstackContainer.getConnectionUri());

    const createQueueResponse = await sqsClient.send(
      new CreateQueueCommand({
        QueueName: QUEUE_NAME,
        Attributes: {
          DelaySeconds: '0',
          MessageRetentionPeriod: '86400',
        },
      }),
    );

    console.log(`🔧 SQS Queue created successfully: ${createQueueResponse.QueueUrl}`);
    console.log('🔧 Stack is ready !');
  }

  public async stop(): Promise<void> {
    if (!this.localstackContainer) {
      console.log('❌ No LocalStack container to stop !');
      return;
    }
    await this.localstackContainer.stop();
    LocalStackClient.instance = undefined;
    console.log('🧹 LocalStack container stopped !');
  }
}
