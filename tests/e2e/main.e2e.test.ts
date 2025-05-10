import { LocalStackClient } from '../localstack';
import { deleteAllSqsMessages, getSqsMessages, initSqs, sendSqsMessages } from '../sqs';

jest.setTimeout(60000);

describe('Main e2e', () => {
  let localStackSingleton: LocalStackClient;

  beforeAll(async () => {
    localStackSingleton = await LocalStackClient.getInstance();
    await localStackSingleton.initStack();
    initSqs();
  });

  afterAll(async () => {
    await localStackSingleton.stop();
  });

  beforeEach(async () => {
    await deleteAllSqsMessages();
  });

  test('should send a api gateway request and receive a response in lambda logs', async () => {
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
