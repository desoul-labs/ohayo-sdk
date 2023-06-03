import { S3 } from '@aws-sdk/client-s3';
import { createContext } from 'react';

export type FourEverLandContextValue = {
  client?: S3;
};

export const FourEverLandContext = createContext<FourEverLandContextValue>({
  client: undefined,
});
