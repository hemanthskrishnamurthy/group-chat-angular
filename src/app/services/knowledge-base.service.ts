import { computed, inject, Injectable, signal } from '@angular/core';
import {
  KNOWLEDGE_FILE_ACCEPT,
  KNOWLEDGE_FILE_EXTENSIONS,
  ParsedJson,
} from '../models/receptionist.models';
import { JsonKnowledgeService } from './json-knowledge.service';

@Injectable({ providedIn: 'root' })
export class KnowledgeBaseService {
  private readonly json = inject(JsonKnowledgeService);

  readonly accept = KNOWLEDGE_FILE_ACCEPT;
  readonly knowledgeBase = signal('');
  readonly documentFile = signal<File | null>(null);
  readonly documentText = signal('');
  readonly documentStatus = signal('');
  readonly documentError = signal('');

  readonly parsedKnowledgeJson = computed(() => this.json.parse(this.knowledgeBase()));
  readonly parsedDocumentJson = computed(() => this.json.parse(this.documentText()));
  readonly supportedFileList = KNOWLEDGE_FILE_EXTENSIONS.map((item) => item.toUpperCase()).join(', ');

  readonly knowledgeBaseForSearch = computed(() => this.searchText(this.knowledgeBase(), this.parsedKnowledgeJson()));
  readonly documentTextForSearch = computed(() => this.searchText(this.documentText(), this.parsedDocumentJson()));
  readonly combinedKnowledge = computed(() =>
    [this.knowledgeBaseForSearch(), this.documentTextForSearch()]
      .map((item) => item.trim())
      .filter(Boolean)
      .join('\n\n')
  );
  readonly hasKnowledge = computed(() => Boolean(this.combinedKnowledge()));
  readonly jsonStatusLabel = computed(() => {
    const parsed = this.parsedKnowledgeJson();
    if (parsed.valid) return 'Valid JSON knowledge';
    if (parsed.error) return 'Invalid JSON';
    return 'Plain text knowledge';
  });
  readonly isKnowledgeValid = computed(() => {
    const parsed = this.parsedKnowledgeJson();
    return Boolean(this.knowledgeBase().trim() && !parsed.error);
  });

  updateKnowledge(value: string): void {
    this.knowledgeBase.set(value);
  }

  formatKnowledgeJson(): void {
    const formatted = this.json.prettyPrint(this.knowledgeBase());
    if (formatted) this.knowledgeBase.set(formatted);
  }

  readDocument(file: File): void {
    this.documentError.set('');

    if (!this.isSupportedFile(file)) {
      this.documentFile.set(null);
      this.documentText.set('');
      this.documentStatus.set('');
      this.documentError.set(`Unsupported file. Use ${this.supportedFileList}.`);
      return;
    }

    this.documentFile.set(file);
    this.documentStatus.set('Reading document');

    const extension = this.getExtension(file.name);
    if (extension === 'txt' || extension === 'json' || file.type === 'application/json' || file.type === 'text/plain') {
      this.readTextFile(file);
      return;
    }

    this.documentText.set(
      `Document uploaded: ${file.name}. Connect a backend parser to extract full ${extension.toUpperCase()} content.`
    );
    this.documentStatus.set(`${file.name} attached`);
  }

  removeDocument(): void {
    this.documentFile.set(null);
    this.documentText.set('');
    this.documentStatus.set('');
    this.documentError.set('');
  }

  private readTextFile(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || '');
      this.documentText.set(content);
      const parsed = this.json.parse(content);
      this.documentStatus.set(parsed.valid ? `${file.name} JSON indexed` : `${file.name} indexed`);
    };
    reader.onerror = () => {
      this.documentText.set('');
      this.documentStatus.set('');
      this.documentError.set('Could not read this document in the browser.');
    };
    reader.readAsText(file);
  }

  private isSupportedFile(file: File): boolean {
    const extension = this.getExtension(file.name);
    return KNOWLEDGE_FILE_EXTENSIONS.includes(extension as (typeof KNOWLEDGE_FILE_EXTENSIONS)[number]);
  }

  private getExtension(fileName: string): string {
    return fileName.split('.').pop()?.toLowerCase() || '';
  }

  private searchText(value: string, parsed: ParsedJson): string {
    return parsed.valid ? this.json.flatten(parsed.data).join('\n') : value;
  }
}
