import given from '../../steps/given';
import when from '../../steps/when';
import then from '../../steps/then';
import teardown from '../../steps/teardown';
import { ConsultationRequest } from '../../../functions/requestConsultation';

describe('When a customer sends a consultation request', () => {
  let consultationRequest: ConsultationRequest;
  let consultationId: string;

  beforeAll(async () => {
    consultationRequest = given.a_consultation_request();
    consultationId = await when.customer_sends_consultation_request(
      consultationRequest
    );
    expect(consultationId).toMatch(
      /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/
    );
  });

  afterAll(async () => {
    await teardown.a_consultation(consultationId);
  });

  it('The consultation request is added to the database', async () => {
    const ddbConsultationRequest = await then.consultation_exists_in_DynamoDB(
      consultationId
    );

    expect(ddbConsultationRequest).toMatchObject({
      PK: `CONSULTATION#${consultationId}`,
      SK: `REQUEST`,
      firstName: consultationRequest.firstName,
      lastName: consultationRequest.lastName,
      email: consultationRequest.email,
      phone: consultationRequest.phone,
      zipCode: consultationRequest.zipCode,
      projectSize: consultationRequest.projectSize,
      message: consultationRequest.message,
    });
  });
});
