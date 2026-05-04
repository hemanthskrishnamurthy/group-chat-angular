import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { VoiceTrainingService } from '../services/voice-training.service';
import { VoiceSampleService } from '../services/voice-sample.service';
import { formatBytes } from '../utils/file-format';

@Component({
  selector: 'app-voice-sample-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="panel voice-panel" aria-labelledby="voice-title">
      <div class="panel-heading">
        <div>
          <p class="section-kicker"><span class="icon-mark">VO</span> Receptionist voice</p>
          <h2 id="voice-title">Train from upload or recording</h2>
        </div>
        <button
          *ngIf="voice.activeVoice()"
          class="icon-button"
          type="button"
          title="Remove voice"
          (click)="removeVoice()"
        >
          x
        </button>
      </div>

      <div class="voice-actions">
        <label class="upload-zone">
          <span class="large-icon">Upload</span>
          <span>MP3 voice file</span>
          <small>MP3, WAV, M4A, WebM</small>
          <input type="file" accept="audio/*,.mp3" (change)="onFileChange($event)" />
        </label>

        <div class="record-box">
          <div class="record-meter" [class.active]="voice.isRecording()">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
          <strong>{{ voice.isRecording() ? voice.formatTime(voice.recordingSeconds()) : 'Record sample' }}</strong>
          <button
            *ngIf="!voice.isRecording(); else stopRecordingTemplate"
            class="primary-button"
            type="button"
            (click)="startRecording()"
          >
            Record
          </button>
          <ng-template #stopRecordingTemplate>
            <button class="danger-button" type="button" (click)="voice.stopRecording()">Stop</button>
          </ng-template>
        </div>
      </div>

      <div *ngIf="voice.activeVoice() as sample" class="voice-card">
        <div class="voice-icon">VA</div>
        <div>
          <strong>{{ sample.name }}</strong>
          <span>{{ sample.type }} - {{ formatBytes(sample.size) }}</span>
          <small>Training sample selected</small>
        </div>
        <audio [src]="sample.url" controls></audio>
      </div>

      <div class="voice-training-card" [class.ready]="training.isReady()" [class.error]="training.trainingError()">
        <div>
          <strong>{{ training.statusLabel() }}</strong>
          <small *ngIf="!training.trainingError()">
            Train the receptionist with the uploaded or recorded sample before generating cloned audio.
          </small>
          <small *ngIf="training.trainingError()" class="training-error">{{ training.trainingError() }}</small>
        </div>
        <button
          class="secondary-button"
          type="button"
          [disabled]="!voice.hasVoice() || training.trainingState() === 'training'"
          (click)="training.trainVoice()"
        >
          {{ training.trainingState() === 'training' ? 'Training...' : training.isReady() ? 'Retrain voice' : 'Train voice model' }}
        </button>
        <small>
          This calls <code>/api/voice/train</code>. Connect that endpoint to your voice cloning provider so the answer
          audio uses this exact uploaded voice.
        </small>
      </div>
    </section>
  `,
})
export class VoiceSamplePanelComponent {
  readonly voice = inject(VoiceSampleService);
  readonly training = inject(VoiceTrainingService);
  readonly formatBytes = formatBytes;

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.training.reset();
    this.voice.useUploadedFile(file);
  }

  removeVoice(): void {
    this.training.reset();
    this.voice.removeVoice();
  }

  startRecording(): void {
    this.training.reset();
    void this.voice.startRecording();
  }
}
