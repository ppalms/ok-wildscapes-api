import { Chance } from 'chance';
import { ConsultationRequest } from '../../functions/requestConsultation';
const chance = new Chance();

const a_random_client = () => {
  const firstName = chance.first({ nationality: 'en' });
  const lastName = chance.last({ nationality: 'en' });
  const suffix = chance.string({
    length: 6,
    pool: 'abcdefghijklmnopqrstuvwxyz',
  });
  const email = `${firstName}-${lastName}-${suffix}@test.com`;
  const phone = chance.phone({ formatted: false, mobile: true });
  const zipCode = chance.zip({ formatted: false, country: 'US' });

  return {
    firstName,
    lastName,
    email,
    phone,
    zipCode,
  };
};

const a_consultation_request = (): ConsultationRequest => {
  const client = a_random_client();
  const consultationRequest = {
    firstName: client.firstName,
    lastName: client.lastName,
    email: client.email,
    phone: client.phone,
    zipCode: client.zipCode,
    projectSize: 'UNDER_1K',
    message: chance.sentence({ words: 10 }),
  };
  return consultationRequest;
};

export default { a_random_client, a_consultation_request };
