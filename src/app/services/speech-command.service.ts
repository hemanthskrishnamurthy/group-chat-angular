import { Injectable, signal } from '@angular/core';
import { SpeechRecognitionConstructor, SpeechRecognitionLike } from '../models/receptionist.models';

@Injectable({ providedIn: 'root' })
export class SpeechCommandService {
  readonly isListening = signal(false);
  private recognition: SpeechRecognitionLike | null = null;

  start(onTranscript: (value: string) => void): void {
    const speechWindow = window as Window &
      typeof globalThis & {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
      };
    const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech-to-text is not available in this browser. Please type the visitor question.');
      return;
    }

    const recognition = new SpeechRecognition();
    this.recognition = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || '')
        .join(' ');
      onTranscript(transcript);
    };
    recognition.onend = () => this.isListening.set(false);
    recognition.onerror = () => this.isListening.set(false);

    this.isListening.set(true);
    recognition.start();
  }

  stop(): void {
    this.recognition?.stop();
    this.isListening.set(false);
  }
}
