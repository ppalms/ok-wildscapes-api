import { Context, LambdaRequest } from '@aws-appsync/utils';

export const request = (ctx: Context) => {
  const request: LambdaRequest = {
    operation: 'Invoke',
    payload: {
      arguments: ctx.args.consultationRequest,
    },
  };

  return request;
};

export const response = (ctx: Context) => {
  return ctx.result;
};
