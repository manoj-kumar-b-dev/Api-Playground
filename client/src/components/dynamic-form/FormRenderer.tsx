import React, { useEffect, useRef } from 'react';
import type { FormDefinition } from '../../types/dynamicForm.types';
import { FormSection } from './FormSection';
import { FieldRenderer } from './FieldRenderer';
import { Key, HelpCircle, FileText, Globe } from 'lucide-react';

interface FormRendererProps {
  formDefinition: FormDefinition;
  formValues: Record<string, any>;
  validationErrors: Record<string, string>;
  onChange: (path: string, value: any) => void;
}

export const FormRenderer: React.FC<FormRendererProps> = ({
  formDefinition,
  formValues,
  validationErrors,
  onChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter parameter groups
  const pathParams = formDefinition.parameters.filter((p) => p.location === 'path');
  const queryParams = formDefinition.parameters.filter((p) => p.location === 'query');
  const headerParams = formDefinition.parameters.filter((p) => p.location === 'header');
  const bodyField = formDefinition.body;

  // Auto focus first invalid field when errors change
  useEffect(() => {
    const errorKeys = Object.keys(validationErrors);
    if (errorKeys.length > 0 && containerRef.current) {
      const firstInvalidField = containerRef.current.querySelector('.border-red-500');
      if (firstInvalidField) {
        firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (firstInvalidField as HTMLElement).focus?.();
      }
    }
  }, [validationErrors]);

  const paramsValues = formValues.parameters || {};

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Path Parameters Section */}
      {pathParams.length > 0 && (
        <FormSection
          title="Path Parameters"
          icon={<Globe className="w-4 h-4" />}
          badge={pathParams.length}
          description="Parameters embedded directly in the API URL path"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pathParams.map((p) => (
              <FieldRenderer
                key={p.id}
                definition={p}
                value={paramsValues[p.name]}
                onChange={(val) => onChange(`parameters.${p.name}`, val)}
                error={validationErrors[`parameters.${p.name}`]}
              />
            ))}
          </div>
        </FormSection>
      )}

      {/* Query Parameters Section */}
      {queryParams.length > 0 && (
        <FormSection
          title="Query Parameters"
          icon={<HelpCircle className="w-4 h-4" />}
          badge={queryParams.length}
          description="Key-value pairs appended after ? in the URL"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {queryParams.map((p) => (
              <FieldRenderer
                key={p.id}
                definition={p}
                value={paramsValues[p.name]}
                onChange={(val) => onChange(`parameters.${p.name}`, val)}
                error={validationErrors[`parameters.${p.name}`]}
              />
            ))}
          </div>
        </FormSection>
      )}

      {/* Header Parameters Section */}
      {headerParams.length > 0 && (
        <FormSection
          title="Header Parameters"
          icon={<Key className="w-4 h-4" />}
          badge={headerParams.length}
          description="Custom HTTP headers sent with the request"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {headerParams.map((p) => (
              <FieldRenderer
                key={p.id}
                definition={p}
                value={paramsValues[p.name]}
                onChange={(val) => onChange(`parameters.${p.name}`, val)}
                error={validationErrors[`parameters.${p.name}`]}
              />
            ))}
          </div>
        </FormSection>
      )}

      {/* Request Body Section */}
      {bodyField && (
        <FormSection
          title="Request Body Payload"
          icon={<FileText className="w-4 h-4" />}
          badge={formDefinition.contentType || 'JSON'}
          description={bodyField.description || 'Payload data sent with POST/PUT/PATCH requests'}
        >
          <FieldRenderer
            definition={bodyField}
            value={formValues.body}
            onChange={(val) => onChange('body', val)}
            error={validationErrors['body']}
          />
        </FormSection>
      )}
    </div>
  );
};
