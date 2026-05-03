import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';

type ParsedJson = {
  valid: boolean;
  data: unknown;
  error: string;
};

type ActiveVoice = {
  name: string;
  type: string;
  size: number;
  url: string;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionResultEventLike = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="app-shell">
      <section class="workspace">
        <div class="intro">
          <div>
            <p class="eyebrow"><span class="icon-mark">AI</span> AI receptionist modeling</p>
            <h1>Voice Receptionist Studio</h1>
            <p>
              Train the receptionist voice, add business knowledge, then ask a visitor question by
              voice or text and hear a focused answer.
            </p>
          </div>
          <div class="status-strip">
            <span [class.ready]="activeVoice">Voice</span>
            <span [class.ready]="combinedKnowledge">Knowledge</span>
            <span [class.ready]="visitorQuestion.trim()">Question</span>
            <span [class.ready]="generatedScript">Answer</span>
          </div>
        </div>

        <div class="layout">
          <section class="panel voice-panel" aria-labelledby="voice-title">
            <div class="panel-heading">
              <div>
                <p class="section-kicker"><span class="icon-mark">VO</span> Receptionist voice</p>
                <h2 id="voice-title">Train from upload or recording</h2>
              </div>
              <button
                *ngIf="activeVoice"
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
                <span>Drop in an MP3 voice file</span>
                <small>MP3, WAV, M4A, or WebM sample</small>
                <input type="file" accept="audio/*,.mp3" (change)="onFileChange($event)" />
              </label>

              <div class="record-box">
                <div class="record-meter" [class.active]="isRecording">
                  <span></span><span></span><span></span><span></span><span></span>
                </div>
                <strong>{{ isRecording ? formatTime(recordingSeconds) : 'Record voice sample' }}</strong>
                <button
                  *ngIf="!isRecording; else stopRecordingTemplate"
                  class="primary-button"
                  type="button"
                  (click)="startRecording()"
                >
                  Record
                </button>
                <ng-template #stopRecordingTemplate>
                  <button class="danger-button" type="button" (click)="stopRecording()">Stop</button>
                </ng-template>
              </div>
            </div>

            <div *ngIf="activeVoice as voice" class="voice-card">
              <div class="voice-icon">VA</div>
              <div>
                <strong>{{ voice.name }}</strong>
                <span>{{ voice.type }} - {{ formatBytes(voice.size) }}</span>
              </div>
              <audio [src]="voice.url" controls></audio>
            </div>
          </section>

          <section class="panel form-panel" aria-labelledby="knowledge-title">
            <div class="panel-heading">
              <div>
                <p class="section-kicker"><span class="icon-mark">KB</span> Knowledge base</p>
                <h2 id="knowledge-title">Give the receptionist business context</h2>
              </div>
            </div>

            <div class="field-grid">
              <label>
                <span>Receptionist name</span>
                <input [(ngModel)]="modelName" type="text" placeholder="Front desk assistant" />
              </label>
              <label>
                <span>Speaking style</span>
                <select [(ngModel)]="speakingStyle">
                  <option>Warm and clear</option>
                  <option>Confident and concise</option>
                  <option>Calm and instructional</option>
                  <option>Energetic and friendly</option>
                </select>
              </label>
            </div>

            <div class="document-row">
              <label class="document-upload">
                <span class="large-icon">Doc</span>
                <span>Upload knowledge document</span>
                <small>TXT, MD, CSV, JSON, PDF, DOC, or DOCX</small>
                <input
                  type="file"
                  accept=".txt,.md,.csv,.json,.pdf,.doc,.docx,text/*,application/pdf"
                  (change)="onDocumentChange($event)"
                />
              </label>
              <div *ngIf="documentFile" class="document-card">
                <button class="icon-button" type="button" title="Remove document" (click)="removeDocument()">
                  x
                </button>
                <strong>{{ documentFile.name }}</strong>
                <span>{{ formatBytes(documentFile.size) }}</span>
                <small>{{ documentStatus }}</small>
              </div>
            </div>

            <label>
              <span>Knowledge base</span>
              <textarea
                [(ngModel)]="knowledgeBase"
                rows="7"
                placeholder='Paste plain text or JSON, for example: {"services":["appointments","billing"],"hours":"9 AM to 6 PM"}'
              ></textarea>
            </label>
            <div class="json-tools">
              <span
                class="json-status"
                [class.valid]="parsedKnowledgeJson.valid"
                [class.invalid]="parsedKnowledgeJson.error"
              >
                {{ jsonStatusLabel }}
              </span>
              <button
                class="text-button"
                type="button"
                [disabled]="!parsedKnowledgeJson.valid"
                (click)="formatKnowledgeJson()"
              >
                Format JSON
              </button>
            </div>

            <label class="question-field">
              <span>Visitor question or command</span>
              <div class="question-input">
                <textarea
                  [(ngModel)]="visitorQuestion"
                  rows="4"
                  placeholder="Ask what a visitor or caller would say, for example: Can I book an appointment tomorrow?"
                ></textarea>
                <button
                  class="mic-button"
                  type="button"
                  [title]="isListening ? 'Stop voice command' : 'Speak visitor command'"
                  (click)="isListening ? stopCommandListening() : startCommandListening()"
                >
                  {{ isListening ? 'Stop' : 'Mic' }}
                </button>
              </div>
            </label>

            <button
              class="generate-button"
              type="button"
              [disabled]="!canGenerate || isGenerating"
              (click)="generatePreview()"
            >
              {{ isGenerating ? 'Preparing answer...' : 'Answer as receptionist' }}
            </button>
          </section>
        </div>

        <section class="output-band" aria-live="polite">
          <div class="output-copy">
            <p class="section-kicker"><span class="icon-mark">OUT</span> Receptionist answer</p>
            <h2>{{ generatedScript ? 'Answer ready' : 'Waiting for a visitor question' }}</h2>
            <p>
              {{
                generatedScript ||
                  'The receptionist will answer the visitor question using the knowledge base and uploaded document, instead of reading the entire source content aloud.'
              }}
            </p>
            <button
              *ngIf="generatedScript"
              class="speak-button"
              type="button"
              (click)="isSpeaking ? stopSpeaking() : speakPreview()"
            >
              {{ isSpeaking ? 'Stop answer' : 'Play answer' }}
            </button>
          </div>
          <div class="signal-visual" [class.active]="generatedScript || isGenerating || isSpeaking">
            <span></span><span></span><span></span><span></span><span></span><span></span>
          </div>
        </section>
      </section>
    </main>
  `,
})
export class AppComponent implements OnDestroy {
  voiceFile: File | null = null;
  recordedBlob: Blob | null = null;
  recordedUrl = '';
  uploadedUrl = '';
  documentFile: File | null = null;
  documentText = '';
  documentStatus = '';
  knowledgeBase = '';
  visitorQuestion = 'What services do you provide and how can I book an appointment?';
  modelName = 'AI Receptionist';
  speakingStyle = 'Warm and clear';
  isRecording = false;
  isListening = false;
  isGenerating = false;
  isSpeaking = false;
  generatedScript = '';
  recordingSeconds = 0;
  private recorder: MediaRecorder | null = null;
  private commandRecognition: SpeechRecognitionLike | null = null;
  private chunks: Blob[] = [];
  private timerId: number | null = null;

  get activeVoice(): ActiveVoice | null {
    if (this.recordedBlob) {
      return {
        name: `Recorded sample (${this.formatTime(this.recordingSeconds)})`,
        type: this.recordedBlob.type || 'audio/webm',
        size: this.recordedBlob.size,
        url: this.recordedUrl,
      };
    }

    if (this.voiceFile) {
      return {
        name: this.voiceFile.name,
        type: this.voiceFile.type || 'audio/mpeg',
        size: this.voiceFile.size,
        url: this.uploadedUrl,
      };
    }

    return null;
  }

  get parsedKnowledgeJson(): ParsedJson {
    return this.parseJsonSafely(this.knowledgeBase);
  }

  get parsedDocumentJson(): ParsedJson {
    return this.parseJsonSafely(this.documentText);
  }

  get knowledgeBaseForSearch(): string {
    const parsed = this.parsedKnowledgeJson;
    return parsed.valid ? this.flattenJson(parsed.data).join('\n') : this.knowledgeBase;
  }

  get documentTextForSearch(): string {
    const parsed = this.parsedDocumentJson;
    return parsed.valid ? this.flattenJson(parsed.data).join('\n') : this.documentText;
  }

  get combinedKnowledge(): string {
    return [this.knowledgeBaseForSearch, this.documentTextForSearch]
      .map((item) => item.trim())
      .filter(Boolean)
      .join('\n\n');
  }

  get canGenerate(): boolean {
    return Boolean(this.activeVoice && this.combinedKnowledge && this.visitorQuestion.trim());
  }

  get jsonStatusLabel(): string {
    if (this.parsedKnowledgeJson.valid) return 'Valid JSON knowledge detected';
    if (this.parsedKnowledgeJson.error) return 'JSON needs fixing before it can be parsed';
    return 'Plain text knowledge';
  }

  formatBytes(size: number): string {
    if (!size) return '0 KB';
    const units = ['B', 'KB', 'MB', 'GB'];
    const power = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
    return `${(size / 1024 ** power).toFixed(power ? 1 : 0)} ${units[power]}`;
  }

  formatTime(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.clearObjectUrl('uploadedUrl');
    this.clearObjectUrl('recordedUrl');
    this.recordedBlob = null;
    this.recordingSeconds = 0;
    this.voiceFile = file;
    this.uploadedUrl = URL.createObjectURL(file);
  }

  onDocumentChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.documentFile = file;
    this.documentStatus = 'Reading document...';

    const extension = file.name.split('.').pop()?.toLowerCase();
    const textTypes = ['txt', 'md', 'csv', 'json', 'html', 'xml'];

    if (file.type.startsWith('text/') || textTypes.includes(extension || '')) {
      const reader = new FileReader();
      reader.onload = () => {
        const content = String(reader.result || '');
        this.documentText = content;
        const parsed = this.parseJsonSafely(content);
        this.documentStatus = parsed.valid
          ? `${file.name} JSON added to receptionist knowledge.`
          : `${file.name} added to receptionist knowledge.`;
      };
      reader.onerror = () => {
        this.documentText = '';
        this.documentStatus = 'Could not read this document in the browser.';
      };
      reader.readAsText(file);
      return;
    }

    this.documentText = `Document uploaded: ${file.name}. Connect a backend document parser to extract the full contents of this ${extension?.toUpperCase() || 'file'} document.`;
    this.documentStatus = `${file.name} attached. Text extraction for PDF/DOCX needs a backend parser.`;
  }

  removeDocument(): void {
    this.documentFile = null;
    this.documentText = '';
    this.documentStatus = '';
  }

  async startRecording(): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert('Voice recording is not available in this browser.');
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.chunks = [];
    this.clearObjectUrl('recordedUrl');
    this.recordedBlob = null;
    this.voiceFile = null;
    this.clearObjectUrl('uploadedUrl');
    this.recordingSeconds = 0;

    const mediaRecorder = new MediaRecorder(stream);
    this.recorder = mediaRecorder;
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) this.chunks.push(event.data);
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(this.chunks, { type: mediaRecorder.mimeType || 'audio/webm' });
      this.recordedBlob = blob;
      this.recordedUrl = URL.createObjectURL(blob);
      stream.getTracks().forEach((track) => track.stop());
    };

    mediaRecorder.start();
    this.isRecording = true;
    this.timerId = window.setInterval(() => {
      this.recordingSeconds += 1;
    }, 1000);
  }

  stopRecording(): void {
    if (!this.recorder || this.recorder.state === 'inactive') return;
    this.recorder.stop();
    this.recorder = null;
    this.isRecording = false;
    if (this.timerId) window.clearInterval(this.timerId);
  }

  removeVoice(): void {
    if (this.isRecording) this.stopRecording();
    this.voiceFile = null;
    this.recordedBlob = null;
    this.chunks = [];
    this.recordingSeconds = 0;
    this.clearObjectUrl('uploadedUrl');
    this.clearObjectUrl('recordedUrl');
  }

  startCommandListening(): void {
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
    this.commandRecognition = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || '')
        .join(' ');
      this.visitorQuestion = transcript;
    };
    recognition.onend = () => {
      this.isListening = false;
    };
    recognition.onerror = () => {
      this.isListening = false;
    };

    this.isListening = true;
    recognition.start();
  }

  stopCommandListening(): void {
    this.commandRecognition?.stop();
    this.isListening = false;
  }

  formatKnowledgeJson(): void {
    const parsed = this.parseJsonSafely(this.knowledgeBase);
    if (!parsed.valid) return;
    this.knowledgeBase = JSON.stringify(parsed.data, null, 2);
  }

  generatePreview(): void {
    if (!this.canGenerate) return;

    this.isGenerating = true;
    this.generatedScript = '';
    this.stopSpeaking();

    window.setTimeout(() => {
      const answer = this.getAnswerFromKnowledge(this.visitorQuestion, this.combinedKnowledge);
      this.generatedScript = `Hello, this is ${this.modelName || 'the AI receptionist'}. ${answer} I can also take your details, answer another question, or help route you to the right team.`;
      this.isGenerating = false;
    }, 700);
  }

  speakPreview(): void {
    if (!this.generatedScript || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(this.generatedScript);
    utterance.rate = this.speakingStyle.includes('Calm') ? 0.9 : 1;
    utterance.pitch = this.speakingStyle.includes('Energetic') ? 1.1 : 1;
    utterance.onend = () => {
      this.isSpeaking = false;
    };
    utterance.onerror = () => {
      this.isSpeaking = false;
    };
    this.isSpeaking = true;
    window.speechSynthesis.speak(utterance);
  }

  stopSpeaking(): void {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    this.isSpeaking = false;
  }

  ngOnDestroy(): void {
    if (this.isRecording) this.stopRecording();
    if (this.isListening) this.stopCommandListening();
    this.stopSpeaking();
    this.clearObjectUrl('uploadedUrl');
    this.clearObjectUrl('recordedUrl');
  }

  private clearObjectUrl(key: 'uploadedUrl' | 'recordedUrl'): void {
    if (this[key]) {
      URL.revokeObjectURL(this[key]);
      this[key] = '';
    }
  }

  private parseJsonSafely(value: string): ParsedJson {
    const trimmed = value.trim();
    if (!trimmed || !['{', '['].includes(trimmed[0])) {
      return { valid: false, data: null, error: '' };
    }

    try {
      return { valid: true, data: JSON.parse(trimmed) as unknown, error: '' };
    } catch (error) {
      return { valid: false, data: null, error: error instanceof Error ? error.message : 'Invalid JSON' };
    }
  }

  private flattenJson(value: unknown, path = ''): string[] {
    if (Array.isArray(value)) {
      return value.flatMap((item, index) => this.flattenJson(item, `${path}[${index}]`));
    }

    if (value && typeof value === 'object') {
      return Object.entries(value).flatMap(([key, item]) =>
        this.flattenJson(item, path ? `${path}.${key}` : key)
      );
    }

    const label = path.replace(/[\W_]+/g, ' ').trim();
    return [`${label}: ${String(value ?? '')}`.trim()];
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
