import { BaseParser } from './BaseParser';
import type { ParserType } from '../../types/ParserType';
import type { NormalizedApiSchema } from '../../types/NormalizedSchema';
import type { ParserResult } from '../../types/ParserResult';
import { maskSecretsInText } from '../../utils/securityMasker';
import { api } from '../../service/api';

export class AISchemaExtractor extends BaseParser {
  readonly sourceType: ParserType = 'ai';

  public canParse(_input: string | object): boolean {
    return true;
  }

  public async parseSchema(input: string | object): Promise<{ schema: NormalizedApiSchema; warnings: string[] }> {
    const rawText = typeof input === 'string' ? input : JSON.stringify(input);
    const sanitizedText = maskSecretsInText(rawText);

    try {
      const res = await api.post<{ success: boolean; data: { schema: NormalizedApiSchema; confidence: number; warnings: string[] } }>(
        '/ai/enrich-schema',
        {
          documentationText: sanitizedText,
          ruleSchema: null,
          missingFields: ['types', 'descriptions', 'validations'],
        }
      );

      const enriched = res.data.data;
      return {
        schema: enriched.schema || {
          title: 'AI Extracted API',
          servers: [],
          endpoints: [],
          specType: 'ai',
        },
        warnings: enriched.warnings || ['Schema enriched using AI.'],
      };
    } catch (err: any) {
      return {
        schema: {
          title: 'AI Extraction Error',
          servers: [],
          endpoints: [],
          specType: 'ai',
        },
        warnings: [`AI extraction failed: ${err.message || 'Server error'}`],
      };
    }
  }

  public async enrich(ruleResult: ParserResult): Promise<ParserResult> {
    const rawText = ruleResult.rawInput || JSON.stringify(ruleResult.schema);
    const sanitizedText = maskSecretsInText(rawText);

    try {
      const res = await api.post<{ success: boolean; data: { schema: NormalizedApiSchema; confidence: number; warnings: string[] } }>(
        '/ai/enrich-schema',
        {
          documentationText: sanitizedText,
          ruleSchema: ruleResult.schema,
          missingFields: ruleResult.warnings,
        }
      );

      const enriched = res.data.data;
      return {
        schema: enriched.schema || ruleResult.schema,
        confidence: enriched.confidence || 0.9,
        warnings: [...ruleResult.warnings, ...(enriched.warnings || []), 'Schema enhanced using AI.'],
        sourceType: 'ai',
        isAiEnriched: true,
        rawInput: ruleResult.rawInput,
      };
    } catch {
      return {
        ...ruleResult,
        warnings: [...ruleResult.warnings, 'AI enrichment unavailable. Using rule-parsed schema.'],
      };
    }
  }
}
