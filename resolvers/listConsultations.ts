import { Context, DynamoDBScanRequest } from '@aws-appsync/utils';
import { ConsultationRequest } from '../src/generated/graphql';

export const request = (ctx: Context): DynamoDBScanRequest => {
  const request: DynamoDBScanRequest = {
    operation: 'Scan',
    limit: ctx.args.limit,
    consistentRead: false
  };

  return request;
};

export const response = (ctx: Context): ConsultationRequest[] => {
  return ctx.result.items.map((ddbItem: any) => ({
    consultationId: ddbItem.PK.split('#')[1],
    firstName: ddbItem.firstName,
    lastName: ddbItem.lastName,
    email: ddbItem.email,
    phone: ddbItem.phone,
    zipCode: ddbItem.zipCode,
    projectSize: ddbItem.projectSize,
    message: ddbItem.message
  }));
};
