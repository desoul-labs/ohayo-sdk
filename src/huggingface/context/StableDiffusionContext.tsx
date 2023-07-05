import { createContext } from 'react';

export type StableDiffusionContextValue = {
  apiKey: string;
};

export const StableDiffusionContext =
  createContext<StableDiffusionContextValue>({ apiKey: '' });
