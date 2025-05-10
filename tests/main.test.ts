import { SQSClient } from '@aws-sdk/client-sqs';
import { StartedLocalStackContainer } from '@testcontainers/localstack';
import { startLocalstack, stopLocalstack } from './localstack';
import { deleteAllSqsMessages, getSqsMessages, initSqs, sendSqsMessages } from './sqs';

jest.setTimeout(60000);

describe('Sqs integration', () => {
  let sqsClient: SQSClient;
  let localstack: StartedLocalStackContainer;

  beforeAll(async () => {
    localstack = await startLocalstack();
    sqsClient = initSqs();
  });

  afterAll(async () => {
    await stopLocalstack();
  });

  beforeEach(async () => {
    await deleteAllSqsMessages();
  });

  test('should send 2 sqs messages', async () => {
    // Given
    const message1 = { message: 'fakeMessage1' };
    const message2 = { message: 'fakeMessage2' };
    const messages = [message1, message2];

    // When
    await sendSqsMessages(messages);
    const messagesBeforePurge = await getSqsMessages();
    await deleteAllSqsMessages();
    const messagesAfterPurge = await getSqsMessages();

    // Then
    expect(messagesBeforePurge).toHaveLength(2);
    expect(messagesAfterPurge).toHaveLength(0);
  });
});
