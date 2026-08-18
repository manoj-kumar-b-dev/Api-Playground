import type { IParser } from './IParser';
import type { ParserType } from '../../types/ParserType';
import { OpenAPIParser } from './OpenAPIParser';
import { SwaggerParser } from './SwaggerParser';
import { CurlParser } from './CurlParser';
import { DocumentationParser } from './DocumentationParser';
import { ManualParser } from './ManualParser';

class ParserRegistry {
  private parsers: Map<ParserType, IParser> = new Map();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults() {
    this.register(new OpenAPIParser());
    this.register(new SwaggerParser());
    this.register(new CurlParser());
    this.register(new DocumentationParser());
    this.register(new ManualParser());
  }

  public register(parser: IParser) {
    this.parsers.set(parser.sourceType, parser);
  }

  public get(type: ParserType): IParser | undefined {
    return this.parsers.get(type);
  }

  public getAll(): IParser[] {
    return Array.from(this.parsers.values());
  }

  public detectParser(input: string | object): IParser | undefined {
    for (const parser of this.parsers.values()) {
      if (parser.canParse(input)) {
        return parser;
      }
    }
    return undefined;
  }
}

export const parserRegistry = new ParserRegistry();
