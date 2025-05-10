import { SQSHelper } from '@/helpers/sqs.helper';
import { SQSEvent } from 'aws-lambda';

export const handler = async (event: SQSEvent): Promise<{ statusCode: number; body: string }> => {
  try {
    console.log('Received event:', JSON.stringify(event, null, 2));

    const messages = SQSHelper.getMessagesFromSQSRecords(event.Records);

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
