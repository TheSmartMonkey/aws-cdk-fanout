import { StackName } from '@/models/contruct.model';
import { Duration } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

interface LambdaConstructProps {
  readonly name: string;
  readonly stackName: StackName;
  readonly handlerPath: string;
  readonly lambdaRole: iam.Role;
  readonly envVars: Record<string, string>;
  readonly lambdaOptions?: NodejsFunctionProps;
}

export class LambdaConstruct extends Construct {
  public readonly lambdaFunction: NodejsFunction;

  constructor(scope: Construct, id: string, props: LambdaConstructProps) {
    super(scope, id);

    const functionName = `${props.stackName}-${props.name}`;

    // Create the lambda function
    this.lambdaFunction = new NodejsFunction(this, functionName, {
      functionName,
      entry: props.handlerPath,
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_LATEST,
      memorySize: 512,
      timeout: Duration.seconds(20),
      role: props.lambdaRole,
      logRetention: RetentionDays.TWO_MONTHS,
      bundling: {
        minify: true,
        sourceMap: true,
        target: 'node18',
        esbuildArgs: {
          '--platform': 'node',
          '--packages': 'external',
        },
      },
      environment: props.envVars,
      ...props.lambdaOptions,
    });
  }
}
