import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserVoiceService } from '../services/browser-voice.service';
import { VoiceSampleService } from '../services/voice-sample.service';
import { formatBytes } from '../utils/file-format';

@Component({
  selector: 'app-voice-sample-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
          (click)="voice.removeVoice()"
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
            (click)="voice.startRecording()"
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
        </div>
        <audio [src]="sample.url" controls></audio>
      </div>

      <div class="browser-voice-card">
        <label>
          <span>Playback preview voice</span>
          <select
            [ngModel]="browserVoice.selectedVoiceURI()"
            (ngModelChange)="browserVoice.setSelectedVoice($event)"
          >
            <option value="">Browser default voice</option>
            <option *ngFor="let option of browserVoice.voices()" [value]="option.voiceURI">
              {{ option.name }} ({{ option.lang }})
            </option>
          </select>
        </label>
        <small>
          Uploaded samples are stored as the training reference. The local play button uses this browser voice until a
          voice-cloning API is connected.
        </small>
      </div>
    </section>
  `,
})
export class VoiceSamplePanelComponent implements OnInit {
  readonly voice = inject(VoiceSampleService);
  readonly browserVoice = inject(BrowserVoiceService);
  readonly formatBytes = formatBytes;

  ngOnInit(): void {
    this.browserVoice.loadVoices();
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.voice.useUploadedFile(file);
  }
}
