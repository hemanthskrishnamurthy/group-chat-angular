import { computed, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BrowserVoiceService {
  readonly voices = signal<SpeechSynthesisVoice[]>([]);
  readonly selectedVoiceURI = signal('');

  readonly selectedVoice = computed(() => {
    const selected = this.selectedVoiceURI();
    return this.voices().find((voice) => voice.voiceURI === selected) || null;
  });

  readonly preferredVoiceLabel = computed(() => this.selectedVoice()?.name || 'Browser default voice');

  loadVoices(): void {
    if (!window.speechSynthesis) return;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      this.voices.set(voices);

      if (!this.selectedVoiceURI() && voices.length) {
        const preferred = this.findPreferredFeminineVoice(voices);
        this.selectedVoiceURI.set(preferred?.voiceURI || voices[0].voiceURI);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }

  setSelectedVoice(voiceURI: string): void {
    this.selectedVoiceURI.set(voiceURI);
  }

  private findPreferredFeminineVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
    const preferredNames = [
      'female',
      'woman',
      'zira',
      'susan',
      'hazel',
      'samantha',
      'victoria',
      'karen',
      'moira',
      'tessa',
      'veena',
      'heera',
    ];

    return (
      voices.find((voice) => {
        const label = `${voice.name} ${voice.lang}`.toLowerCase();
        return label.startsWith('en') && preferredNames.some((name) => label.includes(name));
      }) ||
      voices.find((voice) => preferredNames.some((name) => voice.name.toLowerCase().includes(name))) ||
      voices.find((voice) => voice.lang.toLowerCase().startsWith('en')) ||
      null
    );
  }
}
