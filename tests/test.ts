import crypto from 'crypto';

export const AWS_REGION = 'eu-central-1';
export const LOCALSTACK_PORT = 4566;
export const LOCALSTACK_ENDPOINT = `http://localhost:${LOCALSTACK_PORT}`;

export function fakeSqsMessage(message: any) {
  const body = {
    Type: 'Notification',
    MessageId: '666733c2-938f-4723-8e6b-923493e1a3b5',
    TopicArn: 'arn:aws:sns:eu-west-3:000000000000:CreateServerlessAwsWebhookTopic',
    Message: JSON.stringify(message),
    Timestamp: '2024-08-12T20:43:00.303Z',
    UnsubscribeURL:
      'http://localhost.localstack.cloud:4566/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:eu-west-3:000000000000:CreateServerlessAwsWebhookTopic:8ee10d1a-da7f-44f5-a488-e9e24d5e35e6',
    SignatureVersion: '1',
    Signature:
      'C3jXP/7GlZ9Ulh8/Ny81CAw840g4CY4tc89enrC6vG9TaQW+5lp20zpUcd8/MwF8EDi0NqpyFqyDWj2lbqReFcWblEgivbTfzcBeYp2/mliQZ2cjJkg7DFfXDc0YFuT8Gu81Du4zMQ6X2y3GLlGZcl487P3DbQdAwIZHScUFoydcEv0FqT+UUVX9NNdx3X73P0PmG3/i7WC6+DBu8/v+JjNElEKyAk0HTmZQ/QO7HHq/dcXBsOVg/S/meZSSOgceVCwIWjQ07nrZ+KQCMpC+UtJXc9zLByX4wZIlFrtSgoiXunj46MMIWKCVbCU5b2QLmLGAlQK7p/pNu1Wx7iu/QA==',
    SigningCertURL: 'http://localhost.localstack.cloud:4566/_aws/sns/SimpleNotificationService-6c6f63616c737461636b69736e696365.pem',
  };
  return {
    Body: JSON.stringify(body),
    MD5OfBody: 'df9d54dcd66cf950fc492e1879e84ada',
    MessageId: '69328a62-d3a6-409d-b283-371331b7afd9',
    ReceiptHandle:
      'MmVlYjU5Y2QtZTMwNC00YTRiLTkwMzktOTQzNmM0YjhjYTBhIGFybjphd3M6c3FzOnVzLWVhc3QtMTowMDAwMDAwMDAwMDA6Q3JlYXRlU2VydmVybGVzc0F3c1dlYmhvb2tRdWV1ZSA2OTMyOGE2Mi1kM2E2LTQwOWQtYjI4My0zNzEzMzFiN2FmZDkgMTcyMzQ5NjQxMy43NTA5NDQ=',
  };
}

export function randomUUID(): string {
  return crypto.randomUUID();
}
