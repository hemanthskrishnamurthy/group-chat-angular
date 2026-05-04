import { computed, inject, Injectable, signal } from '@angular/core';
import { VoiceSampleService } from './voice-sample.service';

type TrainingState = 'idle' | 'training' | 'ready' | 'error';

@Injectable({ providedIn: 'root' })
export class VoiceTrainingService {
  private readonly voice = inject(VoiceSampleService);

  readonly trainingState = signal<TrainingState>('idle');
  readonly trainedVoiceId = signal('');
  readonly trainedVoiceName = signal('');
  readonly trainingError = signal('');
  readonly synthesizedAudioUrl = signal('');
  readonly isSynthesizing = signal(false);
  readonly synthesisError = signal('');

  readonly isReady = computed(() => this.trainingState() === 'ready' && Boolean(this.trainedVoiceId()));
  readonly statusLabel = computed(() => {
    if (this.trainingState() === 'training') return 'Training voice model';
    if (this.trainingState() === 'ready') return `Trained with ${this.trainedVoiceName()}`;
    if (this.trainingState() === 'error') return 'Voice training needs backend connection';
    return 'Voice sample not trained yet';
  });

  async trainVoice(): Promise<void> {
    const sample = this.voice.trainingSample();
    if (!sample) {
      this.trainingError.set('Upload or record a voice sample first.');
      this.trainingState.set('error');
      return;
    }

    this.trainingState.set('training');
    this.trainingError.set('');
    this.revokeSynthesizedAudio();

    try {
      const formData = new FormData();
      formData.append('voiceSample', sample, this.voice.trainingSampleName());

      const response = await fetch('/api/voice/train', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Training failed with status ${response.status}`);
      }

      const result = (await response.json()) as { voiceId?: string; name?: string };
      if (!result.voiceId) {
        throw new Error('Training response did not include a voiceId.');
      }

      this.trainedVoiceId.set(result.voiceId);
      this.trainedVoiceName.set(result.name || this.voice.trainingSampleName());
      this.trainingState.set('ready');
    } catch (error) {
      this.trainedVoiceId.set('');
      this.trainingState.set('error');
      this.trainingError.set(
        `${error instanceof Error ? error.message : 'Unable to train voice.'} Connect /api/voice/train to a voice cloning provider so uploaded samples can create a reusable receptionist voice.`
      );
    }
  }

  reset(): void {
    this.trainingState.set('idle');
    this.trainedVoiceId.set('');
    this.trainedVoiceName.set('');
    this.trainingError.set('');
    this.synthesisError.set('');
    this.isSynthesizing.set(false);
    this.revokeSynthesizedAudio();
  }

  async synthesizeAnswer(text: string, style: string): Promise<void> {
    if (!this.isReady()) {
      await this.trainVoice();
    }

    if (!this.isReady()) return;

    this.isSynthesizing.set(true);
    this.synthesisError.set('');
    this.revokeSynthesizedAudio();

    try {
      const response = await fetch('/api/voice/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          style,
          voiceId: this.trainedVoiceId(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Synthesis failed with status ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const result = (await response.json()) as { audioUrl?: string };
        if (!result.audioUrl) throw new Error('Synthesis response did not include audioUrl.');
        this.synthesizedAudioUrl.set(result.audioUrl);
        return;
      }

      const audio = await response.blob();
      this.synthesizedAudioUrl.set(URL.createObjectURL(audio));
    } catch (error) {
      this.synthesisError.set(
        `${error instanceof Error ? error.message : 'Unable to synthesize trained voice.'} Connect /api/voice/synthesize to return cloned speech audio from the trained voiceId.`
      );
    } finally {
      this.isSynthesizing.set(false);
    }
  }

  revokeSynthesizedAudio(): void {
    const url = this.synthesizedAudioUrl();
    if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
    this.synthesizedAudioUrl.set('');
  }
}
