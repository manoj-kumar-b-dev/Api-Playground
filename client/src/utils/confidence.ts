import type { NormalizedApiSchema } from '../types/NormalizedSchema';

export const AI_THRESHOLD = 0.8;

/**
 * Calculate deterministic confidence score for a parsed NormalizedApiSchema
 */
export function calculateConfidenceScore(schema: NormalizedApiSchema): number {
  if (!schema || !schema.endpoints || schema.endpoints.length === 0) {
    return 0.0;
  }

  let totalScore = 0;
  const endpointCount = schema.endpoints.length;

  for (const ep of schema.endpoints) {
    let epScore = 0;

    // HTTP Method & URL valid (+0.4)
    if (ep.method && ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].includes(ep.method)) {
      epScore += 0.2;
    }
    if (ep.url && (ep.url.startsWith('/') || ep.url.startsWith('http://') || ep.url.startsWith('https://'))) {
      epScore += 0.2;
    }

    // Parameters completeness (+0.3)
    const allParams = [...ep.pathParams, ...ep.queryParams, ...ep.headers];
    if (allParams.length > 0) {
      const typedParams = allParams.filter((p) => p.field && p.field.type && p.field.type !== 'text');
      const paramCompleteness = (typedParams.length / allParams.length) * 0.3;
      epScore += Math.max(0.15, paramCompleteness);
    } else {
      epScore += 0.3;
    }

    // Body schema completeness (+0.3)
    if (['POST', 'PUT', 'PATCH'].includes(ep.method)) {
      if (ep.body && ep.body.field) {
        if (ep.body.field.type === 'object' && ep.body.field.children && ep.body.field.children.length > 0) {
          epScore += 0.3;
        } else if (ep.body.field.type && ep.body.field.type !== 'text') {
          epScore += 0.2;
        } else {
          epScore += 0.1;
        }
      } else {
        epScore += 0.05;
      }
    } else {
      epScore += 0.3;
    }

    totalScore += Math.min(1.0, epScore);
  }

  const averageConfidence = totalScore / endpointCount;
  return Math.min(0.99, Math.max(0.05, Math.round(averageConfidence * 100) / 100));
}

/**
 * Determine if rule parser score requires AI fallback
 */
export function isAiFallbackNeeded(confidence: number): boolean {
  return confidence < AI_THRESHOLD;
}
