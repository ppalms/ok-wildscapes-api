import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const ddbClient = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(ddbClient);
const { TABLE_NAME } = process.env;

const a_consultation = async (consultationId: string) => {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `CONSULTATION#${consultationId}`,
        SK: `REQUEST`
      }
    })
  );
  console.log(`[${consultationId}] - consultation deleted`);
};

export default { a_consultation };
