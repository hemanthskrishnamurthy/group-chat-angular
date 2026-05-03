import { Injectable } from '@angular/core';
import { ParsedJson } from '../models/receptionist.models';

@Injectable({ providedIn: 'root' })
export class JsonKnowledgeService {
  parse(value: string): ParsedJson {
    const trimmed = value.trim();
    if (!trimmed || !['{', '['].includes(trimmed[0])) {
      return { valid: false, data: null, error: '' };
    }

    try {
      return { valid: true, data: JSON.parse(trimmed) as unknown, error: '' };
    } catch (error) {
      return { valid: false, data: null, error: error instanceof Error ? error.message : 'Invalid JSON' };
    }
  }

  flatten(value: unknown, path = ''): string[] {
    if (Array.isArray(value)) {
      return value.flatMap((item, index) => this.flatten(item, `${path}[${index}]`));
    }

    if (value && typeof value === 'object') {
      return Object.entries(value).flatMap(([key, item]) =>
        this.flatten(item, path ? `${path}.${key}` : key)
      );
    }

    const label = path.replace(/[\W_]+/g, ' ').trim();
    return [`${label}: ${String(value ?? '')}`.trim()];
  }

  prettyPrint(value: string): string | null {
    const parsed = this.parse(value);
    return parsed.valid ? JSON.stringify(parsed.data, null, 2) : null;
  }
}
