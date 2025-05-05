#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { createCdkStack } from '../lib/cdk-stack';

const app = new cdk.App({ context: { stage: 'dev', region: 'eu-west-3' } });
const stage = app.node.tryGetContext('stage');
const region = app.node.tryGetContext('region');

try {
  if (!stage) throw new Error('STAGE is not defined !');

  createCdkStack(app, `${stage}-aws-cdk-fanout`, { stage, region });
} catch (error) {
  console.error(error);
  process.exit(1);
}
