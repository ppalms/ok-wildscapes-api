import given from '../../steps/given';
import when from '../../steps/when';
import then from '../../steps/then';
import teardown from '../../steps/teardown';
import { ConsultationRequest } from '../../../src/generated/graphql';

describe('When requestConsultation runs', () => {
  let consultationReq: ConsultationRequest;
  let consultationId: string;

  beforeAll(async () => {
    consultationReq = given.a_consultation_request();
    consultationId = await when.we_invoke_request_consultation(consultationReq);
  });

  afterAll(async () => {
    await teardown.a_consultation(consultationId);
  });

  it('The consultation request is added to the database', async () => {
    const ddbConsultationReq =
      await then.consultation_exists_in_DynamoDB(consultationId);

    expect(ddbConsultationReq).toMatchObject({
      PK: `CONSULTATION#${consultationId}`,
      SK: `REQUEST`,
      firstName: consultationReq.firstName,
      lastName: consultationReq.lastName,
      email: consultationReq.email,
      phone: consultationReq.phone,
      zipCode: consultationReq.zipCode,
      projectSize: consultationReq.projectSize,
      message: consultationReq.message,
      createdAt: expect.stringMatching(
        /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?Z?/g
      )
    });
  });
});
