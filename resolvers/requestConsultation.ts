import { Context, LambdaRequest } from '@aws-appsync/utils';
import { MutationRequestConsultationArgs } from '../src/generated/graphql';

export const request = (
  ctx: Context<MutationRequestConsultationArgs>
): LambdaRequest => {
  const request: LambdaRequest = {
    operation: 'Invoke',
    payload: {
      arguments: ctx.args.consultationRequest
    }
  };

  return request;
};

export const response = (ctx: Context): string | undefined => {
  return ctx.result;
};
