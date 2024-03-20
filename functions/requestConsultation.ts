import * as sts from '@aws-sdk/client-sts';
import * as ses from '@aws-sdk/client-ses';
import * as dynamodb from '@aws-sdk/client-dynamodb';
import { Logger } from '@aws-lambda-powertools/logger';
import { marshall } from '@aws-sdk/util-dynamodb';
import { v4 } from 'uuid';

export interface ConsultationRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  zipCode: string;
  projectSize: string;
  message: string;
}

const { SERVICE_NAME, TABLE_NAME, SHARED_SERVICES_ROLE_ARN } = process.env;
const logger = new Logger({ serviceName: SERVICE_NAME });

export const handler = async (event: {
  arguments: ConsultationRequest;
}): Promise<string | undefined> => {
  logger.info(
    `Received consultation request ${JSON.stringify(event.arguments)}`
  );
  let consultationRequest: ConsultationRequest;

  try {
    consultationRequest = <ConsultationRequest>event.arguments;
  } catch (error) {
    logger.error('Invalid request', error as Error);

    return undefined;
  }

  const consultationId = v4();
  logger.info(`Creating consultation ${consultationId}`);

  try {
    const stsClient = new sts.STSClient({ region: 'us-east-1' });
    const assumedRole = await stsClient.send(
      new sts.AssumeRoleCommand({
        RoleArn: SHARED_SERVICES_ROLE_ARN,
        RoleSessionName: `WorkloadAccess_${consultationId}`,
      })
    );

    const accessKeyId = assumedRole.Credentials?.AccessKeyId;
    const secretAccessKey = assumedRole.Credentials?.SecretAccessKey;
    const sessionToken = assumedRole.Credentials?.SessionToken;

    if (!accessKeyId || !secretAccessKey || !sessionToken) {
      logger.critical(
        'Failed to assume shared services role',
        JSON.stringify(assumedRole)
      );
      return undefined;
    }

    logger.info('Emailing consultation request');
    const sesClient = new ses.SESClient({
      credentials: {
        accessKeyId,
        secretAccessKey,
        sessionToken,
      },
      region: 'us-east-1',
    });
    await sesClient.send(
      new ses.SendEmailCommand({
        Source: 'no-reply@okwildscapes.com',
        Destination: {
          ToAddresses: ['patrick@okwildscapes.com'],
        },
        Message: {
          Subject: {
            Data: 'New consultation request',
          },
          Body: {
            Html: {
              Data: `<h1>New consultation request</h1>
<div>
  <p>
    Name: ${consultationRequest.firstName} ${consultationRequest.lastName}<br />
    Email: ${consultationRequest.email}<br />
    Phone: ${consultationRequest.phone}<br />
    Project Size: ${consultationRequest.projectSize}<br />
    Message: ${consultationRequest.message}
  </p>
</div>`,
            },
          },
        },
      })
    );
  } catch (error) {
    logger.critical('Consultation request email failed', error as Error);
    return undefined;
  }

  try {
    const dbClient = new dynamodb.DynamoDBClient();

    const consultationRequestItem = {
      PK: `CONSULTATION#${consultationId}`,
      SK: 'REQUEST',
      ...consultationRequest,
      createdAt: new Date().toISOString(),
    };

    const putItemCommand = new dynamodb.PutItemCommand({
      TableName: TABLE_NAME!,
      Item: marshall(consultationRequestItem),
    });

    await dbClient.send(putItemCommand);
    logger.info(`Saved consultation request ${consultationRequestItem.PK}`);

    return consultationId;
  } catch (error) {
    logger.error('Error saving consultation request', error as Error);
    return undefined;
  }
};
