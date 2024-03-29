import given from '../../steps/given';
import when from '../../steps/when';
import then from '../../steps/then';
import teardown from '../../steps/teardown';
import { ConsultationRequest } from '../../../src/generated/graphql';

describe('When a customer requests a consultation', () => {
  let consultationReq: ConsultationRequest;
  let consultationId: string;

  beforeAll(async () => {
    consultationReq = given.a_consultation_request();
    consultationId =
      await when.a_customer_requests_consultation(consultationReq);
    expect(consultationId).toMatch(
      /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/
    );
  });

  afterAll(async () => {
    await teardown.a_consultation(consultationId);
  });

  it('The request appears when consultant calls listConsultations', async () => {
    const consultations: ConsultationRequest[] =
      await when.a_user_calls_listConsultations();

    expect(consultations).toBeInstanceOf(Array);
    const consultation = consultations.find(
      (c: ConsultationRequest) => c.consultationId === consultationId
    );

    expect(consultation).toBeTruthy();
    expect(consultation).toMatchObject({
      ...consultationReq,
      consultationId
    });
  });
});
