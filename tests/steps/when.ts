import { ConsultationRequest } from '../../functions/requestConsultation';
import { GraphQL } from '../lib/graphql';
require('dotenv').config({ path: '.env.test.local' });
require('dotenv').config({ path: '.env' });
const { GraphQlApiUrl, GraphQlApiPublicKey } = process.env;

const customer_sends_consultation_request = async (
  consultationRequest: ConsultationRequest
): Promise<string> => {
  const requestConsultation = `mutation RequestConsultation($consultationRequest: ConsultationRequestInput!) {
  requestConsultation(consultationRequest: $consultationRequest)
}`;

  const variables = {
    consultationRequest: {
      firstName: consultationRequest.firstName,
      lastName: consultationRequest.lastName,
      email: consultationRequest.email,
      phone: consultationRequest.phone,
      zipCode: consultationRequest.zipCode,
      projectSize: consultationRequest.projectSize,
      message: consultationRequest.message,
    },
  };

  const data = await GraphQL(
    GraphQlApiUrl,
    requestConsultation,
    variables,
    GraphQlApiPublicKey
  );
  const result = data.requestConsultation;
  if (!result) {
    throw new Error('Consultation request failed');
  }

  console.log('requestConsultation', result);

  return result;
};

export default {
  customer_sends_consultation_request,
};
