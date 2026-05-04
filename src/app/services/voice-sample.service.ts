import { computed, Injectable, OnDestroy, signal } from '@angular/core';
import { ActiveVoice } from '../models/receptionist.models';

@Injectable({ providedIn: 'root' })
export class VoiceSampleService implements OnDestroy {
  readonly voiceFile = signal<File | null>(null);
  readonly recordedBlob = signal<Blob | null>(null);
  readonly recordedUrl = signal('');
  readonly uploadedUrl = signal('');
  readonly isRecording = signal(false);
  readonly recordingSeconds = signal(0);

  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private timerId: number | null = null;

  readonly activeVoice = computed<ActiveVoice | null>(() => {
    const recorded = this.recordedBlob();
    if (recorded) {
      return {
        name: `Recorded sample (${this.formatTime(this.recordingSeconds())})`,
        type: recorded.type || 'audio/webm',
        size: recorded.size,
        url: this.recordedUrl(),
      };
    }

    const file = this.voiceFile();
    if (file) {
      return {
        name: file.name,
        type: file.type || 'audio/mpeg',
        size: file.size,
        url: this.uploadedUrl(),
      };
    }

    return null;
  });
  readonly hasVoice = computed(() => Boolean(this.activeVoice()));
  readonly trainingSample = computed<File | Blob | null>(() => this.recordedBlob() || this.voiceFile());
  readonly trainingSampleName = computed(() => this.activeVoice()?.name || 'voice sample');

  useUploadedFile(file: File): void {
    this.clearObjectUrl('uploadedUrl');
    this.clearObjectUrl('recordedUrl');
    this.recordedBlob.set(null);
    this.recordingSeconds.set(0);
    this.voiceFile.set(file);
    this.uploadedUrl.set(URL.createObjectURL(file));
  }

  async startRecording(): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert('Voice recording is not available in this browser.');
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.chunks = [];
    this.clearObjectUrl('recordedUrl');
    this.recordedBlob.set(null);
    this.voiceFile.set(null);
    this.clearObjectUrl('uploadedUrl');
    this.recordingSeconds.set(0);

    const mediaRecorder = new MediaRecorder(stream);
    this.recorder = mediaRecorder;
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) this.chunks.push(event.data);
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(this.chunks, { type: mediaRecorder.mimeType || 'audio/webm' });
      this.recordedBlob.set(blob);
      this.recordedUrl.set(URL.createObjectURL(blob));
      stream.getTracks().forEach((track) => track.stop());
    };

    mediaRecorder.start();
    this.isRecording.set(true);
    this.timerId = window.setInterval(() => {
      this.recordingSeconds.update((seconds) => seconds + 1);
    }, 1000);
  }

  stopRecording(): void {
    if (!this.recorder || this.recorder.state === 'inactive') return;
    this.recorder.stop();
    this.recorder = null;
    this.isRecording.set(false);
    if (this.timerId) window.clearInterval(this.timerId);
  }

  removeVoice(): void {
    if (this.isRecording()) this.stopRecording();
    this.voiceFile.set(null);
    this.recordedBlob.set(null);
    this.chunks = [];
    this.recordingSeconds.set(0);
    this.clearObjectUrl('uploadedUrl');
    this.clearObjectUrl('recordedUrl');
  }

  formatTime(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  ngOnDestroy(): void {
    if (this.isRecording()) this.stopRecording();
    this.clearObjectUrl('uploadedUrl');
    this.clearObjectUrl('recordedUrl');
  }

  private clearObjectUrl(key: 'uploadedUrl' | 'recordedUrl'): void {
    const url = key === 'uploadedUrl' ? this.uploadedUrl() : this.recordedUrl();
    if (!url) return;
    URL.revokeObjectURL(url);
    if (key === 'uploadedUrl') this.uploadedUrl.set('');
    if (key === 'recordedUrl') this.recordedUrl.set('');
  }
}
