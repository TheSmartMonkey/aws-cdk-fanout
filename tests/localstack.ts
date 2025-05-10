import { CreateQueueCommand } from '@aws-sdk/client-sqs';
import { LocalstackContainer, StartedLocalStackContainer } from '@testcontainers/localstack';
import { LOCALSTACK_PORT } from './helpers';
import { initSqs, QUEUE_NAME } from './sqs';

export class LocalStackSingleton {
  private static instance?: StartedLocalStackContainer;

  private constructor() {}

  public static async getInstance(): Promise<StartedLocalStackContainer> {
    if (LocalStackSingleton.instance) return LocalStackSingleton.instance;

    console.log('🚀 Starting LocalStack container...');
    LocalStackSingleton.instance = await new LocalstackContainer('localstack/localstack:3').withExposedPorts(LOCALSTACK_PORT).start();
    console.log(`🚀 LocalStack started at: ${LocalStackSingleton.instance.getConnectionUri()} !`);

    // Create SQS client
    console.log('🔧 Creating stack...');
    const sqsClient = initSqs(LocalStackSingleton.instance.getConnectionUri());

    // Create a new SQS queue
    const createQueueResponse = await sqsClient.send(
      new CreateQueueCommand({
        QueueName: QUEUE_NAME,
        Attributes: {
          DelaySeconds: '0',
          MessageRetentionPeriod: '86400', // 24 hours
        },
      }),
    );

    const queueUrl = createQueueResponse.QueueUrl;
    console.log(`🔧 SQS Queue created successfully: ${queueUrl}`);
    console.log('🔧 Stack is ready !');
    return LocalStackSingleton.instance;
  }

  public static async stopInstance(): Promise<void> {
    if (!LocalStackSingleton.instance) {
      console.log('❌ No LocalStack container to stop !');
      return;
    }
    await LocalStackSingleton.instance.stop();
    LocalStackSingleton.instance = undefined;
    console.log('🧹 LocalStack container stopped !');
  }
}
