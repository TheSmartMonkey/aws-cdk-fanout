import { LocalStackSingleton } from './localstack';
import { deleteAllSqsMessages, getSqsMessages, initSqs, sendSqsMessages } from './sqs';

jest.setTimeout(60000);

describe('Sqs e2e 2', () => {
  beforeAll(async () => {
    await LocalStackSingleton.getInstance();
    initSqs();
  });

  afterAll(async () => {
    await LocalStackSingleton.stopInstance();
  });

  beforeEach(async () => {
    await deleteAllSqsMessages();
  });

  test('should sqs2 send 2 sqs messages', async () => {
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
