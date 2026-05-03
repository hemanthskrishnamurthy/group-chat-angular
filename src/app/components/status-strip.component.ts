import { Component, inject } from '@angular/core';
import { KnowledgeBaseService } from '../services/knowledge-base.service';
import { ReceptionistSessionService } from '../services/receptionist-session.service';
import { VoiceSampleService } from '../services/voice-sample.service';

@Component({
  selector: 'app-status-strip',
  standalone: true,
  template: `
    <div class="status-strip">
      <span [class.ready]="voice.hasVoice()">Voice</span>
      <span [class.ready]="knowledge.hasKnowledge()">Knowledge</span>
      <span [class.ready]="session.hasQuestion()">Question</span>
      <span [class.ready]="session.generatedScript()">Answer</span>
    </div>
  `,
})
export class StatusStripComponent {
  readonly voice = inject(VoiceSampleService);
  readonly knowledge = inject(KnowledgeBaseService);
  readonly session = inject(ReceptionistSessionService);
}
