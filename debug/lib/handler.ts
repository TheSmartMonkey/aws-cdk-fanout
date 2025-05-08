import { SQSEvent, SQSRecord } from 'aws-lambda';

export const handler = async (event: SQSEvent): Promise<{ statusCode: number; body: string }> => {
  try {
    console.log('Received event:', JSON.stringify(event, null, 2));

    const messages = SQSHelper.getMessagesFromSQSRecords<any>(event.Records);

    console.log({ messages });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Successfully processed SQS messages' }),
    };
  } catch (error) {
    console.error('Error processing event:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error processing SQS messages', error }),
    };
  }
};

export type SqsMessage<T> = {
  messageId: string;
  body: T;
};

class SQSHelper {
  static getMessagesFromSQSRecords<T>(sqsRecords: SQSRecord[]): SqsMessage<T>[] {
    const messages = sqsRecords.map((sqsRecord): SqsMessage<T> | undefined => SQSHelper.getMessageFromSQSRecord<T>(sqsRecord)) ?? [];
    return messages as SqsMessage<T>[];
  }

  static getMessageFromSQSRecord<T>(sqsRecord: SQSRecord): SqsMessage<T> | undefined {
    if (sqsRecord?.body) {
      const body = JSON.parse(sqsRecord?.body);
      return {
        messageId: sqsRecord?.messageId,
        body: JSON.parse(body.Message),
      };
    }
    return undefined;
  }
}
