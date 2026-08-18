
import type { IParser } from './IParser';
import type { ParserResult } from '../../types/ParserResult';
import type { ParserType } from '../../types/ParserType';
import type { NormalizedApiSchema } from '../../types/NormalizedSchema';
import { calculateConfidenceScore } from '../../utils/confidence';

export abstract class BaseParser implements IParser {
  abstract readonly sourceType: ParserType;

  abstract canParse(input: string | object): boolean;

  abstract parseSchema(input: string | object): Promise<{ schema: NormalizedApiSchema; warnings: string[] }>;

  public async parse(input: string | object): Promise<ParserResult> {
    const rawInput = typeof input === 'string' ? input : JSON.stringify(input);
    try {
      const { schema, warnings } = await this.parseSchema(input);
      const confidence = calculateConfidenceScore(schema);

      return {
        schema,
        confidence,
        warnings,
        sourceType: this.sourceType,
        isAiEnriched: false,
        rawInput,
      };
    } catch (err: any) {
      return {
        schema: {
          title: 'Parsing Error',
          servers: [],
          endpoints: [],
          specType: this.sourceType,
        },
        confidence: 0,
        warnings: [`Failed to parse input with ${this.sourceType} parser: ${err.message}`],
        sourceType: this.sourceType,
        isAiEnriched: false,
        rawInput,
      };
    }
  }
}
