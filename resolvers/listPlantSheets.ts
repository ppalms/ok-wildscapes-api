import { Context, LambdaRequest } from '@aws-appsync/utils';
import { PlantSheet } from '../src/generated/graphql';

export const request = (ctx: Context): LambdaRequest => {
  const request: LambdaRequest = {
    operation: 'Invoke',
    payload: {
      arguments: ctx.args.maxKeys
    }
  };

  return request;
};

export const response = (ctx: Context): PlantSheet[] => {
  return ctx.result;
};
