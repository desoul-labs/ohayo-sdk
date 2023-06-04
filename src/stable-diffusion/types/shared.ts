export type GenerationParameter = {
  H: number;
  W: number;
  enableAttentionSlicing: boolean;
  guidanceScale: number;
  model: string;
  safetychecker: string;
  nSamples: number;
  revision: string;
  seed: number;
  steps: number;
  vae: string;
  prompt: string;
  negativePrompt: string;
};
