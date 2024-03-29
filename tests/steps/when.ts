import { GraphQL } from '../lib/graphql';
require('dotenv').config({ path: '.env.test.local' });
require('dotenv').config({ path: '.env' });
import { ConsultationRequest } from '../../src/generated/graphql';

const { GraphQlApiUrl, GraphQlApiPublicKey } = process.env;

const we_invoke_request_consultation = async (
  consultationRequest: ConsultationRequest
) => {
  const requestConsultation = await import(
    '../../functions/requestConsultation'
  );

  const result = await requestConsultation.handler({
    arguments: consultationRequest
  });

  return result;
};

const a_customer_requests_consultation = async (
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
      message: consultationRequest.message
    }
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

const a_user_calls_listConsultations = async () => {
  const listConsultations = `query ListConsultations($limit: Int!) {
    listConsultations(limit: $limit) {
      consultationId
      firstName
      lastName
      email
      phone
      zipCode
      projectSize
      message
    }
  }`;

  const variables = { limit: 10 };

  const data = await GraphQL(
    process.env.GraphQlApiUrl,
    listConsultations,
    variables,
    GraphQlApiPublicKey
  );

  const consultations = data.listConsultations;
  console.log(`fetched ${consultations.length} consultations`, consultations);
  return consultations;
};

export default {
  we_invoke_request_consultation,
  a_customer_requests_consultation,
  a_user_calls_listConsultations
};
