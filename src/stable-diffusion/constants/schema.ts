import { z } from 'zod';

export const booleanOption = z
  .boolean()
  .default(false)
  .transform(val => (val ? 'yes' : 'no'))
  .optional();

const supportedSchedulers = z
  .enum([
    'DDPMScheduler',
    'DDIMScheduler',
    'PNDMScheduler',
    'LMSDiscreteScheduler',
    'EulerDiscreteScheduler',
    'EulerAncestralDiscreteScheduler',
    'DPMSolverMultistepScheduler',
    'HeunDiscreteScheduler',
    'KDPM2DiscreteScheduler',
    'DPMSolverSinglestepScheduler',
    'KDPM2AncestralDiscreteScheduler',
    'UniPCMultistepScheduler',
    'DDIMInverseScheduler',
    'DEISMultistepScheduler',
    'IPNDMScheduler',
    'KarrasVeScheduler',
    'ScoreSdeVeScheduler',
  ])
  .default('UniPCMultistepScheduler')
  .optional();

export const sharedSchema = z.object({
  modelId: z.string(),
  prompt: z.string(),
  negativePrompt: z.string().nullable().default(null).optional(),
  width: z
    .number()
    .int()
    .gte(8)
    .lte(1024)
    .multipleOf(8)
    .default(512)
    .optional(),
  height: z
    .number()
    .int()
    .gte(8)
    .lte(1024)
    .multipleOf(8)
    .default(512)
    .optional(),
  samples: z.number().int().gte(1).lte(4).default(1).optional(),
  numInferenceSteps: z.number().int().gte(1).lte(50).default(20).optional(),
  safetyChecker: booleanOption,
  enhancePrompt: booleanOption,
  seed: z.number().int().nullish().default(null).optional(),
  guidanceScale: z.number().gte(1).lte(20).default(7.5).optional(),
  tomesd: booleanOption,
  useKarrasSigmas: booleanOption,
  vae: z.string().nullable().default(null).optional(),
  loraStrength: z
    .array(z.number().gte(0).lte(1))
    .nullish()
    .default(null)
    .transform(val => (val ? val.join(',') : null))
    .optional(),
  loraModel: z
    .array(z.string())
    .nullish()
    .default(null)
    .transform(val => (val ? val.join(',') : null))
    .optional(),
  scheduler: supportedSchedulers,
});
