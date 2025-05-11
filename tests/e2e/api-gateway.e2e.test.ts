import { APIGatewayClient } from '@aws-sdk/client-api-gateway';
import { AWS_REGION, LOCALSTACK_ENDPOINT } from '@test/helpers';
import { LocalStackClient } from '../localstack';

jest.setTimeout(60000);

describe('API Gateway E2E', () => {
  let client: LocalStackClient;

  beforeAll(async () => {
    client = await LocalStackClient.getInstance();
    await client.initStack();
  });

  afterAll(async () => {
    await client.stop();
  });

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('should API Gateway region be the same as the localstack region', async () => {
    // Given
    const apiGatewayClient = new APIGatewayClient({
      region: AWS_REGION,
      endpoint: LOCALSTACK_ENDPOINT,
    });

    // When
    const region = await apiGatewayClient.config.region();

    // Then
    expect(region).toEqual(AWS_REGION);
  });
});
