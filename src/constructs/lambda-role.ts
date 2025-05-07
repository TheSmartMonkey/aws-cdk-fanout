import { StackName } from '@/models/contruct.model';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

interface LambdaRoleConstructProps {
  readonly stackName: StackName;
}

export class LambdaRoleConstruct extends Construct {
  public readonly role: iam.Role;

  constructor(scope: Construct, id: string, props: LambdaRoleConstructProps) {
    super(scope, id);

    // Lambda role
    this.role = new iam.Role(this, `${props.stackName}-lambda-role`, {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });

    // S3 permissions
    this.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'));

    // SQS permissions
    this.role.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['sqs:SendMessage', 'sqs:SendMessageBatch', 'sqs:ReceiveMessage', 'sqs:DeleteMessage', 'sqs:GetQueueAttributes'],
        resources: ['*'],
      }),
    );

    // Add CloudWatch Logs permissions
    this.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'));
  }
}
