export type PredictionResult = {
  status: 'success' | 'processing' | 'error';
  generationTime?: number;
  id: string;
  output: string[];
  eta?: number;
  fetchResult?: string;
};
