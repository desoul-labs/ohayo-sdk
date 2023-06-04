import { S3, S3ClientConfig } from '@aws-sdk/client-s3';
import { useMemo } from 'react';
import { FourEverLandContext } from 'src/4everland/contexts/4EverlandContext';

export type FourEverLandProviderProps = S3ClientConfig;

export const FourEverLandProvider: React.FC<
  React.PropsWithChildren<FourEverLandProviderProps>
> = ({ children, ...configs }) => {
  const s3Client = useMemo(
    () =>
      new S3({
        ...configs,
        endpoint: configs.endpoint ?? 'https://endpoint.4everland.co',
        region: configs.region ?? 'us-east-1',
      }),
    [configs],
  );

  return (
    <FourEverLandContext.Provider value={{ client: s3Client }}>
      {children}
    </FourEverLandContext.Provider>
  );
};
