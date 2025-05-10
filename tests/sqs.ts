import {
  Message,
  PurgeQueueCommand,
  ReceiveMessageCommand,
  SendMessageBatchCommand,
  SendMessageBatchRequestEntry,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { AWS_REGION, LOCALSTACK_ENDPOINT, randomUUID } from './test';

export const QUEUE_NAME = 'my-test-queue';
let sqsClient: SQSClient;
const QUEUE_URL = `http://sqs.${AWS_REGION}.localhost:4566/000000000000/${QUEUE_NAME}`;

export async function sendSqsMessages<T>(messages: T[]): Promise<void> {
  initSqs();
  const cmd = new SendMessageBatchCommand({
    QueueUrl: QUEUE_URL,
    Entries: formatMessagesToBatchMessages<T>(messages),
  });

  await sqsClient.send(cmd);
}

export async function getSqsMessages(): Promise<Message[]> {
  initSqs();
  const cmd = new ReceiveMessageCommand({
    QueueUrl: QUEUE_URL,
    MaxNumberOfMessages: 10,
  });

  const { Messages } = await sqsClient.send(cmd);
  return formatSqsRecevedMessages(Messages || []);
}

export async function deleteAllSqsMessages() {
  initSqs();
  const cmd = new PurgeQueueCommand({
    QueueUrl: QUEUE_URL,
  });

  await sqsClient.send(cmd);
}

export function formatSqsRecevedMessages<T>(messages: Message[]): T {
  return messages.map((m: Message) => JSON.parse(m?.Body || '')) as T;
}

export function formatMessagesToBatchMessages<T>(messages: T[]): SendMessageBatchRequestEntry[] {
  return messages.map((m) => {
    return {
      Id: randomUUID(),
      MessageBody: JSON.stringify(m),
    };
  });
}

export function initSqs(endpoint?: string): SQSClient {
  if (sqsClient) return sqsClient;
  sqsClient = new SQSClient({
    region: AWS_REGION,
    endpoint: endpoint ?? LOCALSTACK_ENDPOINT,
  });
  return sqsClient;
}
