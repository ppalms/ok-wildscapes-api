import { Context, LambdaRequest } from '@aws-appsync/utils';

export const request = (ctx: Context): LambdaRequest => {
  const request: LambdaRequest = {
    operation: 'Invoke',
    payload: {
      arguments: { ...ctx.args }
    }
  };

  return request;
};

export const response = (ctx: Context): [] => {
  return ctx.result;
};
