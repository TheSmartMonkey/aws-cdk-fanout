import { describe, expect, test } from '@jest/globals';
import { httpMessage, inc } from './hello';

describe('hello', () => {
  test('Should increment a number', async () => {
    // Given
    const nb = 3;

    // When
    const response = inc(nb);

    // Then
    expect(response).toEqual(4);
  });

  test('Should return http message', async () => {
    // Given
    const message = 'test message';

    // When
    const response = httpMessage(message);

    // Then
    expect(response.code).toEqual(200);
    expect(response.message).toEqual(message);
  });
});
