import given from '../../steps/given';
import when from '../../steps/when';
import then from '../../steps/then';
import teardown from '../../steps/teardown';
import { ConsultationRequest } from '../../../functions/requestConsultation';

describe('When requestConsultation runs', () => {
  let consultationRequest: ConsultationRequest;
  let consultationId: string;

  beforeAll(async () => {
    consultationRequest = given.a_consultation_request();
    consultationId = await when.we_invoke_request_consultation(
      consultationRequest
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
