import { Context, DynamoDBScanRequest } from '@aws-appsync/utils';

export const request = (ctx: Context) => {
  const request: DynamoDBScanRequest = {
    operation: 'Scan',
    limit: ctx.args.limit,
    consistentRead: false,
  };

  return request;
};

export const response = (ctx: Context) => {
  return ctx.result.items.map((ddbItem: any) => ({
    consultationId: ddbItem.PK.split('#')[1],
    firstName: ddbItem.firstName,
    lastName: ddbItem.lastName,
    email: ddbItem.email,
    phone: ddbItem.phone,
    zipCode: ddbItem.zipCode,
    projectSize: ddbItem.projectSize,
    message: ddbItem.message,
  }));
};
