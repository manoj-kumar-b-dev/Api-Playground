import type { NormalizedApiSchema } from './NormalizedSchema';
import type { ParserType } from './ParserType';

export interface ParserResult {
  schema: NormalizedApiSchema;
  confidence: number; // 0.0 to 1.0
  warnings: string[];
  sourceType: ParserType;
  isAiEnriched: boolean;
  rawInput?: string;
}
