import { computed, inject, Injectable, signal } from '@angular/core';
import { BrowserVoiceService } from './browser-voice.service';
import { KnowledgeBaseService } from './knowledge-base.service';
import { VoiceSampleService } from './voice-sample.service';

@Injectable({ providedIn: 'root' })
export class ReceptionistSessionService {
  private readonly knowledge = inject(KnowledgeBaseService);
  private readonly voice = inject(VoiceSampleService);
  private readonly browserVoice = inject(BrowserVoiceService);

  readonly modelName = signal('AI Receptionist');
  readonly speakingStyle = signal('Warm and clear');
  readonly visitorQuestion = signal('What services do you provide and how can I book an appointment?');
  readonly generatedScript = signal('');
  readonly isGenerating = signal(false);
  readonly isSpeaking = signal(false);

  readonly hasQuestion = computed(() => Boolean(this.visitorQuestion().trim()));
  readonly canGenerate = computed(
    () =>
      this.voice.hasVoice() &&
      this.knowledge.hasKnowledge() &&
      this.hasQuestion() &&
      this.knowledge.isKnowledgeValid()
  );
  readonly disabledReason = computed(() => {
    if (!this.voice.hasVoice()) return 'Add a receptionist voice sample';
    if (!this.knowledge.hasKnowledge()) return 'Add text, JSON, or an approved knowledge file';
    if (!this.knowledge.isKnowledgeValid()) return 'Fix the JSON syntax or switch to plain text';
    if (!this.hasQuestion()) return 'Enter or speak a visitor command';
    return '';
  });

  generateAnswer(): void {
    if (!this.canGenerate()) return;

    this.isGenerating.set(true);
    this.generatedScript.set('');
    this.stopSpeaking();

    window.setTimeout(() => {
      const answer = this.getAnswerFromKnowledge(this.visitorQuestion(), this.knowledge.combinedKnowledge());
      this.generatedScript.set(
        `Hello, this is ${this.modelName() || 'the AI receptionist'}. ${answer} I can also take your details, answer another question, or help route you to the right team.`
      );
      this.isGenerating.set(false);
    }, 700);
  }

  speakAnswer(): void {
    if (!this.generatedScript() || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(this.generatedScript());
    const selectedVoice = this.browserVoice.selectedVoice();
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    }
    utterance.rate = this.speakingStyle().includes('Calm') ? 0.9 : 1;
    utterance.pitch = this.speakingStyle().includes('Energetic') ? 1.1 : 1;
    utterance.onend = () => this.isSpeaking.set(false);
    utterance.onerror = () => this.isSpeaking.set(false);
    this.isSpeaking.set(true);
    window.speechSynthesis.speak(utterance);
  }

  stopSpeaking(): void {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    this.isSpeaking.set(false);
  }

  private getAnswerFromKnowledge(question: string, knowledge: string): string {
    const questionTerms = question
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((term) => term.length > 3);

    const sections = knowledge
      .replace(/[#*_`>|-]/g, ' ')
      .split(/(?<=[.!?])\s+|\n+/)
      .map((section) => section.trim())
      .filter((section) => section.length > 24);

    const ranked = sections
      .map((section, index) => ({
        section,
        index,
        score: questionTerms.reduce(
          (total, term) => total + (section.toLowerCase().includes(term) ? 1 : 0),
          0
        ),
      }))
      .sort((a, b) => b.score - a.score || a.index - b.index);

    const selected = ranked
      .filter((item) => item.score > 0)
      .slice(0, 3)
      .map((item) => item.section);

    return selected.length ? selected.join(' ') : sections.slice(0, 2).join(' ');
  }
}
