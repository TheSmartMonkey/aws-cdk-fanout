# AWS CDK Fanout Construct

CDK contruct for a Fanout pattern with Api Gateway > SNS > SQS > lambda

[![npm version](https://badge.fury.io/js/aws-cdk-fanout.svg)](https://badge.fury.io/js/aws-cdk-fanout)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

The AWS CDK Fanout construct simplifies creating webhook fanout architectures in AWS. It provides a streamlined way to:

1. Receive webhook events via API Gateway
2. Publish events to an SNS topic
3. Route messages to multiple SQS queues based on filtering criteria
4. Process messages with Lambda functions

![Architecture Diagram](https://github.com/TheSmartMonkey/aws-cdk-fanout/blob/main/.github/images/achi.png)

## Installation

```bash
npm install aws-cdk-fanout
```

## Getting Started

### Basic Usage

```typescript
import { FanoutConstruct, FanoutConstructPropsEntity, SqsToLambdaPropsEntity } from 'aws-cdk-fanout';
import { Duration, Stack } from 'aws-cdk-lib';
import { FilterOrPolicy } from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';

export class MyStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    
    // Define the SQS to Lambda mapping
    const orderProcessingQueue = new SqsToLambdaPropsEntity({
      lambdaName: 'process-orders',
      handlerPath: 'src/lambdas/process-orders.ts',
      envVars: {
        ENVIRONMENT: 'dev',
      },
      snsFilter: {
        eventType: FilterOrPolicy.stringFilter({
          allowlist: ['order.created', 'order.updated']
        })
      },
      sqsMaxBatchSize: 10,
      sqsMaxBatchingWindow: Duration.seconds(30),
      sqsVisibilityTimeout: Duration.seconds(120)
    });
    
    // Create the fanout construct
    new FanoutConstruct(this, 'WebhooksFanout', new FanoutConstructPropsEntity({
      stage: 'dev',
      region: 'us-east-1',
      sqsToLambda: [orderProcessingQueue]
    }));
  }
}
```

### Lambda Handler Example

Here's an example of a Lambda handler that processes messages from the SQS queue:

```typescript
import { SQSEvent } from 'aws-lambda';

export const handler = async (event: SQSEvent): Promise<void> => {
  for (const record of event.Records) {
    console.log('Processing message:', record.body);
    
    // Parse the message body
    const message = JSON.parse(record.body);
    const snsMessage = JSON.parse(message.Message);
    
    // Process the message based on your business logic
    console.log('Event data:', snsMessage);
  }
};
```

## Features

- **API Gateway Integration**: Automatically creates an API Gateway endpoint to receive webhook events
- **Message Filtering**: Filter messages using SNS message filtering attributes
- **Dead Letter Queues**: Automatic DLQ setup for failed message processing
- **Batch Processing**: Configure batch size and batching window for Lambda processing
- **Secure by Default**: Includes API key authentication for the API Gateway endpoint

## Advanced Configuration

### Multiple Consumers with Different Filters

```typescript
// Order processing queue
const orderProcessingQueue = new SqsToLambdaPropsEntity({
  lambdaName: 'process-orders',
  handlerPath: 'src/lambdas/process-orders.ts',
  envVars: { /* ... */ },
  snsFilter: {
    eventType: FilterOrPolicy.stringFilter({
      allowlist: ['order.created', 'order.updated']
    })
  },
  sqsMaxBatchSize: 10,
  sqsMaxBatchingWindow: Duration.seconds(30),
  sqsVisibilityTimeout: Duration.seconds(120)
});

// User processing queue
const userProcessingQueue = new SqsToLambdaPropsEntity({
  lambdaName: 'process-users',
  handlerPath: 'src/lambdas/process-users.ts',
  envVars: { /* ... */ },
  snsFilter: {
    eventType: FilterOrPolicy.stringFilter({
      allowlist: ['user.created', 'user.updated']
    })
  },
  sqsMaxBatchSize: 5,
  sqsMaxBatchingWindow: Duration.seconds(60),
  sqsVisibilityTimeout: Duration.seconds(180)
});

// Create the fanout construct with multiple consumers
new FanoutConstruct(this, 'WebhooksFanout', new FanoutConstructPropsEntity({
  stage: 'dev',
  region: 'us-east-1',
  sqsToLambda: [orderProcessingQueue, userProcessingQueue]
}));
```

### Customizing Queue Options

```typescript
const queue = new SqsToLambdaPropsEntity({
  // ... other properties
  queueOptions: {
    retentionPeriod: Duration.days(7),
    dataKeyReuse: Duration.hours(1),
    encryption: sqs.QueueEncryption.KMS_MANAGED
  }
});
```

### Customizing Lambda Options

```typescript
const queue = new SqsToLambdaPropsEntity({
  // ... other properties
  lambdaOptions: {
    memorySize: 512,
    timeout: Duration.seconds(30),
    runtime: Runtime.NODEJS_18_X
  }
});
```

### Turning Off Components

```typescript
new FanoutConstruct(this, 'WebhooksFanout', new FanoutConstructPropsEntity({
  stage: 'dev',
  region: 'us-east-1',
  sqsToLambda: [...],
  removeApiGateway: true,          // Don't create an API Gateway
  removeApiGatewayKeyAuth: true,   // Don't use API key authentication
  removeLambda: true               // Don't create Lambda functions
}));
```

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/TheSmartMonkey/aws-cdk-fanout/blob/main/LICENSE) file for details.
