import * as sts from '@aws-sdk/client-sts';
import * as ses from '@aws-sdk/client-ses';
import * as dynamodb from '@aws-sdk/client-dynamodb';
import { Logger } from '@aws-lambda-powertools/logger';
import { marshall } from '@aws-sdk/util-dynamodb';
import { v4 } from 'uuid';
import { ConsultationRequestInput } from '../src/generated/graphql';

const { SERVICE_NAME, TABLE_NAME, SERVICE_ROLE_ARN, AWS_DEFAULT_REGION } =
  process.env;
const logger = new Logger({ serviceName: SERVICE_NAME });

const handler = async (event: {
  arguments: ConsultationRequestInput;
}): Promise<string | undefined> => {
  logger.info(
    `Received consultation request ${JSON.stringify(event.arguments)}`
  );
  let request: ConsultationRequestInput;
  try {
    request = <ConsultationRequestInput>event.arguments;
  } catch (error) {
    logger.error('Invalid request', error as Error);
    return undefined;
  }

  const consultationId = v4();
  logger.info(`Creating consultation ${consultationId}`);

  try {
    const ddbClient = new dynamodb.DynamoDBClient();

    const consultationReqItem = {
      PK: `CONSULTATION#${consultationId}`,
      SK: 'REQUEST',
      ...request,
      createdAt: new Date().toISOString()
    };

    const putItemCommand = new dynamodb.PutItemCommand({
      TableName: TABLE_NAME!,
      Item: marshall(consultationReqItem)
    });

    await ddbClient.send(putItemCommand);
    logger.info(`Saved consultation request ${consultationReqItem.PK}`);
  } catch (error) {
    logger.error('Error saving consultation request', error as Error);
    return undefined;
  }

  try {
    const stsClient = new sts.STSClient({ region: AWS_DEFAULT_REGION });
    const assumedRole = await stsClient.send(
      new sts.AssumeRoleCommand({
        RoleArn: SERVICE_ROLE_ARN,
        RoleSessionName: `WorkloadAccess_${consultationId}`
      })
    );

    const accessKeyId = assumedRole.Credentials?.AccessKeyId;
    const secretAccessKey = assumedRole.Credentials?.SecretAccessKey;
    const sessionToken = assumedRole.Credentials?.SessionToken;

    if (!accessKeyId || !secretAccessKey || !sessionToken) {
      logger.critical(
        'Failed to assume service role',
        JSON.stringify(assumedRole)
      );
      return undefined;
    }

    logger.info('Emailing consultation request');
    const sesClient = new ses.SESClient({
      credentials: {
        accessKeyId,
        secretAccessKey,
        sessionToken
      },
      region: AWS_DEFAULT_REGION
    });
    await sesClient.send(
      new ses.SendEmailCommand({
        Source: 'no-reply@okwildscapes.com',
        Destination: {
          ToAddresses: ['patrick@okwildscapes.com'],
          BccAddresses: ['save-96Kpu69SrAcm@3.basecamp.com']
        },
        Message: {
          Subject: {
            Data: `Consultation Request - ${request.firstName} ${request.lastName}`
          },
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: `<h1>Project Details</h1>
<div>
  <p>
    Name: ${request.firstName} ${request.lastName}<br />
    Email: ${request.email}<br />
    Phone: ${request.phone}<br />
    Project Size: ${request.projectSize}<br />
    Message: ${request.message}
  </p>
</div>`
            },
            Text: {
              Charset: 'UTF-8',
              Data: `Project Details
              
Name: ${request.firstName} ${request.lastName}
Email: ${request.email}
Phone: ${request.phone}
Project Size: ${request.projectSize}
Message: ${request.message}`
            }
          }
        }
      })
    );
  } catch (error) {
    logger.critical('Consultation request email failed', error as Error);
    return undefined;
  }

  return consultationId;
};

export { handler };
