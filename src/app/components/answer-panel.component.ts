import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { ReceptionistSessionService } from '../services/receptionist-session.service';
import { VoiceTrainingService } from '../services/voice-training.service';

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
          Voice output is generated from the trained uploaded sample. Browser default speech is no longer used for the
          receptionist answer.
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
          [disabled]="training.isSynthesizing()"
          (click)="session.synthesizeTrainedVoice()"
        >
          {{ training.isSynthesizing() ? 'Creating voice audio...' : 'Create trained voice audio' }}
        </button>
      </div>

      <div *ngIf="training.synthesizedAudioUrl()" class="trained-audio-card">
        <strong>Trained voice output</strong>
        <audio [src]="training.synthesizedAudioUrl()" controls autoplay></audio>
      </div>
      <p *ngIf="training.synthesisError()" class="synthesis-error">{{ training.synthesisError() }}</p>

      <div class="signal-visual" [class.active]="session.generatedScript() || session.isGenerating() || training.isSynthesizing()">
        <span></span><span></span><span></span><span></span><span></span><span></span>
      </div>
    </section>
  `,
})
export class AnswerPanelComponent implements OnDestroy {
  readonly session = inject(ReceptionistSessionService);
  readonly training = inject(VoiceTrainingService);

  ngOnDestroy(): void {
    this.session.stopSpeaking();
  }
}
