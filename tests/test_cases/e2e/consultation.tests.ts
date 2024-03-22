import given from '../../steps/given';
import when from '../../steps/when';
import then from '../../steps/then';
import teardown from '../../steps/teardown';
import { ConsultationRequest } from '../../../functions/requestConsultation';

describe('When a customer requests a consultation', () => {
  let consultationRequest: ConsultationRequest;
  let consultationId: string;

  beforeAll(async () => {
    consultationRequest = given.a_consultation_request();
    consultationId = await when.a_customer_requests_consultation(
      consultationRequest
    );
    expect(consultationId).toMatch(
      /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/
    );
  });

  afterAll(async () => {
    await teardown.a_consultation(consultationId);
  });

  it('The request appears when consultant calls listConsultations', async () => {
    const consultations = await when.a_user_calls_listConsultations();

    expect(consultations).toBeInstanceOf(Array);
    expect(consultations.length).toBe(1);
    const consultation = consultations[0];

    expect(consultation).toMatchObject({
      consultationId,
      ...consultationRequest,
    });
  });
});
