import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { BrowserVoiceService } from '../services/browser-voice.service';
import { ReceptionistSessionService } from '../services/receptionist-session.service';

@Component({
  selector: 'app-answer-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="panel answer-panel" aria-live="polite">
      <div class="output-copy">
        <p class="section-kicker"><span class="icon-mark">OUT</span> Receptionist answer</p>
        <h2>{{ session.generatedScript() ? 'Answer ready' : 'Ready for intake' }}</h2>
        <p>
          {{
            session.generatedScript() ||
              'The answer will be generated from the approved knowledge source and visitor command.'
          }}
        </p>
        <small class="voice-disclaimer">
          Preview playback voice: {{ browserVoice.preferredVoiceLabel() }}. Uploaded sample matching requires a
          voice-cloning backend.
        </small>
      </div>

      <div class="answer-actions">
        <button
          class="generate-button"
          type="button"
          [disabled]="!session.canGenerate() || session.isGenerating()"
          [title]="session.disabledReason()"
          (click)="session.generateAnswer()"
        >
          {{ session.isGenerating() ? 'Preparing answer...' : 'Answer receptionist' }}
        </button>
        <button
          *ngIf="session.generatedScript()"
          class="speak-button"
          type="button"
          (click)="session.isSpeaking() ? session.stopSpeaking() : session.speakAnswer()"
        >
          {{ session.isSpeaking() ? 'Stop answer' : 'Play answer' }}
        </button>
      </div>

      <div class="signal-visual" [class.active]="session.generatedScript() || session.isGenerating() || session.isSpeaking()">
        <span></span><span></span><span></span><span></span><span></span><span></span>
      </div>
    </section>
  `,
})
export class AnswerPanelComponent implements OnDestroy {
  readonly session = inject(ReceptionistSessionService);
  readonly browserVoice = inject(BrowserVoiceService);

  ngOnDestroy(): void {
    this.session.stopSpeaking();
  }
}
