import type { ParserResult } from '../../types/ParserResult';
import type { ParserType } from '../../types/ParserType';
import { parserRegistry } from './ParserRegistry';
import { AISchemaExtractor } from './AISchemaExtractor';
import { isAiFallbackNeeded } from '../../utils/confidence';

export class ImportRouter {
  private aiExtractor = new AISchemaExtractor();

  /**
   * Main entry point to route raw input through Rule-Based Parsers first,
   * falling back to AI enrichment only if confidence is below threshold.
   */
  public async routeAndParse(input: string | object, hintType?: ParserType): Promise<ParserResult> {
    let parser = hintType ? parserRegistry.get(hintType) : undefined;
    if (!parser) {
      parser = parserRegistry.detectParser(input);
    }

    if (!parser) {
      // If no rule parser matched, attempt AI Schema Extraction directly
      return this.aiExtractor.parse(input);
    }

    // Step 1: Always execute Rule-Based Parser first
    const ruleResult = await parser.parse(input);

    // Step 2: Check confidence score
    if (!isAiFallbackNeeded(ruleResult.confidence)) {
      // Score >= 0.80 -> Enough information extracted! Skip AI.
      return {
        ...ruleResult,
        warnings: [...ruleResult.warnings, 'Schema generated without AI.'],
      };
    }

    // Step 3: Confidence < 0.80 -> Fallback to AI Schema Enrichment
    try {
      const enrichedResult = await this.aiExtractor.enrich(ruleResult);
      return enrichedResult;
    } catch {
      return {
        ...ruleResult,
        warnings: [...ruleResult.warnings, 'AI enrichment failed. Returning rule-based schema.'],
      };
    }
  }
}

export const importRouter = new ImportRouter();
