export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  AWSDate: { input: any; output: any; }
  AWSDateTime: { input: any; output: any; }
  AWSEmail: { input: any; output: any; }
  AWSIPAddress: { input: any; output: any; }
  AWSJSON: { input: any; output: any; }
  AWSPhone: { input: any; output: any; }
  AWSTime: { input: any; output: any; }
  AWSTimestamp: { input: any; output: any; }
  AWSURL: { input: any; output: any; }
};

export type ConsultationRequest = {
  __typename?: 'ConsultationRequest';
  consultationId: Scalars['ID']['output'];
  email: Scalars['AWSEmail']['output'];
  firstName: Scalars['String']['output'];
  lastName: Scalars['String']['output'];
  message: Scalars['String']['output'];
  phone: Scalars['String']['output'];
  projectSize: ProjectSize;
  zipCode: Scalars['String']['output'];
};

export type ConsultationRequestInput = {
  email: Scalars['AWSEmail']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  message: Scalars['String']['input'];
  phone: Scalars['String']['input'];
  projectSize: ProjectSize;
  zipCode: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  requestConsultation?: Maybe<Scalars['ID']['output']>;
};


export type MutationRequestConsultationArgs = {
  consultationRequest: ConsultationRequestInput;
};

export type PlantSheet = {
  __typename?: 'PlantSheet';
  fileName: Scalars['String']['output'];
  lastModified: Scalars['AWSDateTime']['output'];
};

export enum ProjectSize {
  Over_2K = 'OVER_2K',
  Under_1K = 'UNDER_1K',
  '1KTo_2K' = '_1K_TO_2K'
}

export type Query = {
  __typename?: 'Query';
  listPlantSheets: Array<PlantSheet>;
};


export type QueryListPlantSheetsArgs = {
  maxKeys: Scalars['Int']['input'];
};
