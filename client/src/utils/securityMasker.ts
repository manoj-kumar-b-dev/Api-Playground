/**
 * Utility to mask sensitive credentials (tokens, passwords, secrets, JWTs, API keys)
 * before transmitting text or payloads to external LLMs.
 */
export function maskSecretsInText(text: string): string {
  if (!text) return '';

  let sanitized = text;

  // Mask Bearer tokens: "Authorization: Bearer <token>" or "Bearer <token>"
  sanitized = sanitized.replace(/Bearer\s+([A-Za-z0-9\-\._~\+\/]+=*)/gi, 'Bearer [MASKED_TOKEN]');

  // Mask JWT tokens: eyJ...
  sanitized = sanitized.replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, '[MASKED_JWT]');

  // Mask key-value secrets in headers / query / text e.g. api_key=xyz, password=secret, secret=123
  sanitized = sanitized.replace(
    /(api[-_]?key|password|secret|auth[-_]?token|access[-_]?token|private[-_]?key)\s*[:=]\s*["']?([^\s"'&,]+)["']?/gi,
    '$1: [MASKED_SECRET]'
  );

  // Mask Basic Auth strings: "Basic dXNlcjpwYXNz"
  sanitized = sanitized.replace(/Basic\s+([A-Za-z0-9+/=]{8,})/gi, 'Basic [MASKED_BASIC_AUTH]');

  return sanitized;
}

/**
 * Mask sensitive key-value pairs in objects recursively
 */
export function maskSecretsInObject(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(maskSecretsInObject);

  const maskedObj: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const lowerKey = key.toLowerCase();
    const sensitive = ['password', 'secret', 'token', 'authorization', 'apikey', 'api_key', 'private_key'].some((s) =>
      lowerKey.includes(s)
    );

    if (sensitive) {
      maskedObj[key] = '[MASKED_SECRET]';
    } else {
      maskedObj[key] = maskSecretsInObject(obj[key]);
    }
  }

  return maskedObj;
}
