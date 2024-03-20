import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

const ddbClient = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(ddbClient);
const { TABLE_NAME } = process.env;

const consultation_exists_in_DynamoDB = async (consultationId: string) => {
  console.log(
    `looking for consultation [${consultationId}] in table [${TABLE_NAME}]`
  );
  const resp = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `CONSULTATION#${consultationId}`,
        SK: 'REQUEST',
      },
    })
  );

  expect(resp.Item).toBeTruthy();

  return resp.Item;
};

export default { consultation_exists_in_DynamoDB };
