import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KnowledgeBaseService } from '../services/knowledge-base.service';
import { ReceptionistSessionService } from '../services/receptionist-session.service';
import { formatBytes } from '../utils/file-format';

@Component({
  selector: 'app-knowledge-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="panel form-panel knowledge-panel" aria-labelledby="knowledge-title">
      <div class="panel-heading">
        <div>
          <p class="section-kicker"><span class="icon-mark">KB</span> Knowledge base</p>
          <h2 id="knowledge-title">Business context</h2>
        </div>
      </div>

      <div class="field-grid">
        <label>
          <span>Receptionist name</span>
          <input
            [ngModel]="session.modelName()"
            (ngModelChange)="session.modelName.set($event)"
            type="text"
            placeholder="Front desk assistant"
          />
        </label>
        <label>
          <span>Speaking style</span>
          <select [ngModel]="session.speakingStyle()" (ngModelChange)="session.speakingStyle.set($event)">
            <option>Warm and clear</option>
            <option>Confident and concise</option>
            <option>Calm and instructional</option>
            <option>Energetic and friendly</option>
          </select>
        </label>
      </div>

      <div class="document-row">
        <label class="document-upload" [class.invalid]="knowledge.documentError()">
          <span class="large-icon">Doc</span>
          <span>Knowledge document</span>
          <small>TXT, DOC, PDF, JSON</small>
          <input [accept]="knowledge.accept" type="file" (change)="onDocumentChange($event)" />
        </label>

        <div *ngIf="knowledge.documentFile() as document" class="document-card">
          <button class="icon-button" type="button" title="Remove document" (click)="knowledge.removeDocument()">
            x
          </button>
          <strong>{{ document.name }}</strong>
          <span>{{ formatBytes(document.size) }}</span>
          <small>{{ knowledge.documentStatus() }}</small>
        </div>
      </div>

      <p *ngIf="knowledge.documentError()" class="field-error">{{ knowledge.documentError() }}</p>

      <label>
        <span>Knowledge base</span>
        <textarea
          [ngModel]="knowledge.knowledgeBase()"
          (ngModelChange)="knowledge.updateKnowledge($event)"
          rows="7"
          placeholder='Paste operational text or JSON, for example: {"hours":"9 AM to 6 PM","services":["appointments","billing"]}'
        ></textarea>
      </label>

      <div class="json-tools">
        <span
          class="json-status"
          [class.valid]="knowledge.parsedKnowledgeJson().valid"
          [class.invalid]="knowledge.parsedKnowledgeJson().error"
        >
          {{ knowledge.jsonStatusLabel() }}
        </span>
        <button
          class="text-button"
          type="button"
          [disabled]="!knowledge.parsedKnowledgeJson().valid"
          (click)="knowledge.formatKnowledgeJson()"
        >
          Format JSON
        </button>
      </div>
    </section>
  `,
})
export class KnowledgePanelComponent {
  readonly knowledge = inject(KnowledgeBaseService);
  readonly session = inject(ReceptionistSessionService);
  readonly formatBytes = formatBytes;

  onDocumentChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.knowledge.readDocument(file);
  }
}
