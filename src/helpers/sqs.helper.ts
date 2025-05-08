import { SqsMessage } from '@/models/public.model';
import { SQSRecord } from 'aws-lambda';

export class SQSHelper {
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
