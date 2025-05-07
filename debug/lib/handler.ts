import { SQSEvent } from 'aws-lambda';

export const handler = async (event: SQSEvent): Promise<{ statusCode: number; body: string }> => {
  try {
    console.log('Received event:', JSON.stringify(event, null, 2));

    for (const record of event.Records) {
      console.log('Processing record:', record.messageId);
      console.log('Message body:', record.body);
      // Add your message processing logic here
    }

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
