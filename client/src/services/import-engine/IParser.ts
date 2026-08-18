import type { ParserResult } from '../../types/ParserResult';
import type { ParserType } from '../../types/ParserType';

export interface IParser {
  readonly sourceType: ParserType;

  /**
   * Detect if raw input matches this parser's format
   */
  canParse(input: string | object): boolean;

  /**
   * Parse raw input into standard ParserResult
   */
  parse(input: string | object): Promise<ParserResult>;
}
