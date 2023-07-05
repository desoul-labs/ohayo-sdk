import { StableDiffusionContext } from '../context/StableDiffusionContext';

export type StableDiffusionProviderProps = {
  apiKey: string;
};

export const StableDiffusionProvider: React.FC<
  React.PropsWithChildren<StableDiffusionProviderProps>
> = ({ children, apiKey }) => {
  return (
    <StableDiffusionContext.Provider value={{ apiKey }}>
      {children}
    </StableDiffusionContext.Provider>
  );
};
