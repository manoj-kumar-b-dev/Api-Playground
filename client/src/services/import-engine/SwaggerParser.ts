import { OpenAPIParser } from './OpenAPIParser';
import type { ParserType } from '../../types/ParserType';

export class SwaggerParser extends OpenAPIParser {
  readonly sourceType: ParserType = 'swagger';

  public canParse(input: string | object): boolean {
    if (typeof input === 'object' && input !== null) {
      return 'swagger' in input && (input as any).swagger === '2.0';
    }
    if (typeof input === 'string') {
      const lower = input.toLowerCase();
      return lower.includes('swagger: "2.0"') || lower.includes('"swagger": "2.0"');
    }
    return false;
  }
}
