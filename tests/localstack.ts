import { CreateQueueCommand } from '@aws-sdk/client-sqs';
import { LocalstackContainer, StartedLocalStackContainer } from '@testcontainers/localstack';
import { initSqs, QUEUE_NAME } from './sqs';
import { LOCALSTACK_PORT } from './test';

let localstackClient: StartedLocalStackContainer;

export async function startLocalstack(): Promise<StartedLocalStackContainer> {
  // Start LocalStack container
  if (localstackClient) return localstackClient;
  localstackClient = await new LocalstackContainer('localstack/localstack:3').withExposedPorts(LOCALSTACK_PORT).start();

  console.log(`LocalStack started at: ${localstackClient.getConnectionUri()}`);

  // Create SQS client
  const sqsClient = initSqs(localstackClient.getConnectionUri());

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
  console.log(`SQS Queue created successfully: ${queueUrl}`);
  return localstackClient;
}

export async function stopLocalstack(): Promise<void> {
  await localstackClient.stop();
}
