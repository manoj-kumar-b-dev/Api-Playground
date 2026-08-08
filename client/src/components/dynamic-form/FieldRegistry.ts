import React from 'react';
import type { FieldType } from '../../types/dynamicForm.types';
import type { FieldComponentProps } from './TextField';

import { TextField } from './TextField';
import { NumberField } from './NumberField';
import { SelectField } from './SelectField';
import { CheckboxField } from './CheckboxField';
import { ToggleField } from './ToggleField';
import { DateField } from './DateField';
import { FileUploadField } from './FileUploadField';
import { TextareaField } from './TextareaField';
import { ObjectField } from './ObjectField';
import { ArrayField } from './ArrayField';
import { PolymorphicField } from './PolymorphicField';

export type FieldComponent = React.FC<FieldComponentProps>;

class FieldRegistry {
  private registry: Map<FieldType, FieldComponent> = new Map();
  private fallbackComponent: FieldComponent = TextField;

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults() {
    this.register('text', TextField);
    this.register('password', TextField);
    this.register('email', TextField);
    this.register('url', TextField);
    this.register('number', NumberField);
    this.register('integer', NumberField);
    this.register('select', SelectField);
    this.register('boolean', CheckboxField);
    this.register('toggle' as any, ToggleField);
    this.register('date', DateField);
    this.register('datetime', DateField);
    this.register('file', FileUploadField);
    this.register('textarea', TextareaField);
    this.register('object', ObjectField);
    this.register('array', ArrayField);
    this.register('polymorphic', PolymorphicField);
  }

  public register(type: FieldType, component: FieldComponent) {
    this.registry.set(type, component);
  }

  public get(type: FieldType): FieldComponent {
    return this.registry.get(type) || this.fallbackComponent;
  }
}

export const fieldRegistry = new FieldRegistry();
