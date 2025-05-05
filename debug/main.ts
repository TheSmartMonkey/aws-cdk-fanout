import { HttpMessage, message } from 'create-typescript-npm-library';

if (require.main === module) {
  console.log('hello !');
  message();
  const test: HttpMessage = {} as HttpMessage;
}
