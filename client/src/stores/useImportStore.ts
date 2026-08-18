import { create } from 'zustand';
import type { NormalizedApiSchema, NormalizedEndpoint } from '../types/NormalizedSchema';
import type { ParserType } from '../types/ParserType';
import { importRouter } from '../services/import-engine/ImportRouter';
import { SchemaNormalizer } from '../services/import-engine/SchemaNormalizer';
import { useDynamicFormStore } from './useDynamicFormStore';

interface ImportState {
  importSource: string;
  parserType: ParserType | null;
  normalizedSchema: NormalizedApiSchema | null;
  selectedEndpoint: NormalizedEndpoint | null;
  confidence: number;
  warnings: string[];
  isAiEnriched: boolean;
  loading: boolean;
  error: string | null;

  processImport: (input: string | object, typeHint?: ParserType) => Promise<void>;
  selectEndpoint: (endpointId: string) => void;
  resetImport: () => void;
}

export const useImportStore = create<ImportState>((set, get) => ({
  importSource: '',
  parserType: null,
  normalizedSchema: null,
  selectedEndpoint: null,
  confidence: 0,
  warnings: [],
  isAiEnriched: false,
  loading: false,
  error: null,

  processImport: async (input: string | object, typeHint?: ParserType) => {
    const rawInput = typeof input === 'string' ? input : JSON.stringify(input);
    set({ loading: true, error: null, importSource: rawInput });

    try {
      const result = await importRouter.routeAndParse(input, typeHint);
      const firstEp = result.schema.endpoints[0] || null;

      set({
        parserType: result.sourceType,
        normalizedSchema: result.schema,
        selectedEndpoint: firstEp,
        confidence: result.confidence,
        warnings: result.warnings,
        isAiEnriched: result.isAiEnriched,
        loading: false,
      });

      if (firstEp) {
        // Sync with DynamicFormStore via SchemaNormalizer!
        const formDef = SchemaNormalizer.toFormDefinition(firstEp);
        useDynamicFormStore.setState({
          formDefinition: formDef,
          rawSpec: rawInput,
          baseUrl: result.schema.baseUrl || result.schema.servers[0] || 'https://api.example.com',
          servers: result.schema.servers,
        });
      }
    } catch (err: any) {
      set({
        loading: false,
        error: err.message || 'Import processing failed.',
      });
    }
  },

  selectEndpoint: (endpointId: string) => {
    const { normalizedSchema } = get();
    if (!normalizedSchema) return;

    const found = normalizedSchema.endpoints.find((e) => e.id === endpointId);
    if (found) {
      set({ selectedEndpoint: found });
      const formDef = SchemaNormalizer.toFormDefinition(found);
      useDynamicFormStore.setState({ formDefinition: formDef });
    }
  },

  resetImport: () => {
    set({
      importSource: '',
      parserType: null,
      normalizedSchema: null,
      selectedEndpoint: null,
      confidence: 0,
      warnings: [],
      isAiEnriched: false,
      loading: false,
      error: null,
    });
  },
}));
