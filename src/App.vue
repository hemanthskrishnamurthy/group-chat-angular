<script setup>
import { computed, onBeforeUnmount, ref } from 'vue';
import {
  AudioLines,
  BookOpenText,
  Check,
  CircleStop,
  FileAudio,
  FileText,
  MessageCircleQuestion,
  Mic,
  Play,
  Sparkles,
  Upload,
  Volume2,
  WandSparkles,
  X,
} from 'lucide-vue-next';

const voiceFile = ref(null);
const recordedBlob = ref(null);
const recordedUrl = ref('');
const uploadedUrl = ref('');
const documentFile = ref(null);
const documentText = ref('');
const documentStatus = ref('');
const knowledgeBase = ref('');
const visitorQuestion = ref('What services do you provide and how can I book an appointment?');
const modelName = ref('AI Receptionist');
const speakingStyle = ref('Warm and clear');
const isRecording = ref(false);
const isListening = ref(false);
const isGenerating = ref(false);
const isSpeaking = ref(false);
const generatedScript = ref('');
const recorder = ref(null);
const commandRecognition = ref(null);
const chunks = ref([]);
const recordingSeconds = ref(0);
let timerId = null;

const activeVoice = computed(() => {
  if (recordedBlob.value) {
    return {
      name: `Recorded sample (${formatTime(recordingSeconds.value)})`,
      type: recordedBlob.value.type || 'audio/webm',
      size: recordedBlob.value.size,
      url: recordedUrl.value,
    };
  }

  if (voiceFile.value) {
    return {
      name: voiceFile.value.name,
      type: voiceFile.value.type || 'audio/mpeg',
      size: voiceFile.value.size,
      url: uploadedUrl.value,
    };
  }

  return null;
});

const combinedKnowledge = computed(() =>
  [knowledgeBase.value, documentText.value]
    .map((item) => item.trim())
    .filter(Boolean)
    .join('\n\n')
);

const canGenerate = computed(
  () => activeVoice.value && combinedKnowledge.value && visitorQuestion.value.trim()
);

function formatBytes(size) {
  if (!size) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB'];
  const power = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
  return `${(size / 1024 ** power).toFixed(power ? 1 : 0)} ${units[power]}`;
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function clearObjectUrl(urlRef) {
  if (urlRef.value) {
    URL.revokeObjectURL(urlRef.value);
    urlRef.value = '';
  }
}

function onFileChange(event) {
  const [file] = event.target.files;
  if (!file) return;

  clearObjectUrl(uploadedUrl);
  clearObjectUrl(recordedUrl);
  recordedBlob.value = null;
  recordingSeconds.value = 0;
  voiceFile.value = file;
  uploadedUrl.value = URL.createObjectURL(file);
}

function onDocumentChange(event) {
  const [file] = event.target.files;
  if (!file) return;

  documentFile.value = file;
  documentStatus.value = 'Reading document...';

  const extension = file.name.split('.').pop()?.toLowerCase();
  const textTypes = ['txt', 'md', 'csv', 'json', 'html', 'xml'];

  if (file.type.startsWith('text/') || textTypes.includes(extension)) {
    const reader = new FileReader();
    reader.onload = () => {
      documentText.value = String(reader.result || '');
      documentStatus.value = `${file.name} added to receptionist knowledge.`;
    };
    reader.onerror = () => {
      documentText.value = '';
      documentStatus.value = 'Could not read this document in the browser.';
    };
    reader.readAsText(file);
    return;
  }

  documentText.value = `Document uploaded: ${file.name}. Connect a backend document parser to extract the full contents of this ${extension?.toUpperCase() || 'file'} document.`;
  documentStatus.value = `${file.name} attached. Text extraction for PDF/DOCX needs a backend parser.`;
}

function removeDocument() {
  documentFile.value = null;
  documentText.value = '';
  documentStatus.value = '';
}

async function startRecording() {
  if (!navigator.mediaDevices?.getUserMedia) {
    alert('Voice recording is not available in this browser.');
    return;
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  chunks.value = [];
  clearObjectUrl(recordedUrl);
  recordedBlob.value = null;
  voiceFile.value = null;
  clearObjectUrl(uploadedUrl);
  recordingSeconds.value = 0;

  const mediaRecorder = new MediaRecorder(stream);
  recorder.value = mediaRecorder;
  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.value.push(event.data);
  };
  mediaRecorder.onstop = () => {
    const blob = new Blob(chunks.value, { type: mediaRecorder.mimeType || 'audio/webm' });
    recordedBlob.value = blob;
    recordedUrl.value = URL.createObjectURL(blob);
    stream.getTracks().forEach((track) => track.stop());
  };

  mediaRecorder.start();
  isRecording.value = true;
  timerId = window.setInterval(() => {
    recordingSeconds.value += 1;
  }, 1000);
}

function stopRecording() {
  if (!recorder.value || recorder.value.state === 'inactive') return;
  recorder.value.stop();
  recorder.value = null;
  isRecording.value = false;
  window.clearInterval(timerId);
}

function removeVoice() {
  if (isRecording.value) stopRecording();
  voiceFile.value = null;
  recordedBlob.value = null;
  chunks.value = [];
  recordingSeconds.value = 0;
  clearObjectUrl(uploadedUrl);
  clearObjectUrl(recordedUrl);
}

function startCommandListening() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('Speech-to-text is not available in this browser. Please type the visitor question.');
    return;
  }

  const recognition = new SpeechRecognition();
  commandRecognition.value = recognition;
  recognition.lang = 'en-US';
  recognition.interimResults = true;
  recognition.continuous = false;
  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0].transcript)
      .join(' ');
    visitorQuestion.value = transcript;
  };
  recognition.onend = () => {
    isListening.value = false;
  };
  recognition.onerror = () => {
    isListening.value = false;
  };

  isListening.value = true;
  recognition.start();
}

function stopCommandListening() {
  commandRecognition.value?.stop();
  isListening.value = false;
}

function getAnswerFromKnowledge(question, knowledge) {
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

  if (!selected.length) {
    return sections.slice(0, 2).join(' ');
  }

  return selected.join(' ');
}

function generatePreview() {
  if (!canGenerate.value) return;

  isGenerating.value = true;
  generatedScript.value = '';
  stopSpeaking();

  window.setTimeout(() => {
    const answer = getAnswerFromKnowledge(visitorQuestion.value, combinedKnowledge.value);
    generatedScript.value = `Hello, this is ${modelName.value || 'the AI receptionist'}. ${answer} I can also take your details, answer another question, or help route you to the right team.`;
    isGenerating.value = false;
  }, 700);
}

function speakPreview() {
  if (!generatedScript.value || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(generatedScript.value);
  utterance.rate = speakingStyle.value.includes('Calm') ? 0.9 : 1;
  utterance.pitch = speakingStyle.value.includes('Energetic') ? 1.1 : 1;
  utterance.onend = () => {
    isSpeaking.value = false;
  };
  utterance.onerror = () => {
    isSpeaking.value = false;
  };
  isSpeaking.value = true;
  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  isSpeaking.value = false;
}

onBeforeUnmount(() => {
  if (isRecording.value) stopRecording();
  if (isListening.value) stopCommandListening();
  stopSpeaking();
  clearObjectUrl(uploadedUrl);
  clearObjectUrl(recordedUrl);
});
</script>

<template>
  <main class="app-shell">
    <section class="workspace">
      <div class="intro">
        <div>
          <p class="eyebrow"><Sparkles :size="16" /> AI receptionist modeling</p>
          <h1>Voice Receptionist Studio</h1>
          <p>
            Train the receptionist voice, add business knowledge, then ask a visitor question by
            voice or text and hear a focused answer.
          </p>
        </div>
        <div class="status-strip">
          <span :class="{ ready: activeVoice }"><Check :size="15" /> Voice</span>
          <span :class="{ ready: combinedKnowledge }"><Check :size="15" /> Knowledge</span>
          <span :class="{ ready: visitorQuestion.trim() }"><Check :size="15" /> Question</span>
          <span :class="{ ready: generatedScript }"><Check :size="15" /> Answer</span>
        </div>
      </div>

      <div class="layout">
        <section class="panel voice-panel" aria-labelledby="voice-title">
          <div class="panel-heading">
            <div>
              <p class="section-kicker"><FileAudio :size="16" /> Receptionist voice</p>
              <h2 id="voice-title">Train from upload or recording</h2>
            </div>
            <button v-if="activeVoice" class="icon-button" type="button" title="Remove voice" @click="removeVoice">
              <X :size="18" />
            </button>
          </div>

          <div class="voice-actions">
            <label class="upload-zone">
              <Upload :size="28" />
              <span>Drop in an MP3 voice file</span>
              <small>MP3, WAV, M4A, or WebM sample</small>
              <input type="file" accept="audio/*,.mp3" @change="onFileChange" />
            </label>

            <div class="record-box">
              <div class="record-meter" :class="{ active: isRecording }">
                <span></span><span></span><span></span><span></span><span></span>
              </div>
              <strong>{{ isRecording ? formatTime(recordingSeconds) : 'Record voice sample' }}</strong>
              <button
                v-if="!isRecording"
                class="primary-button"
                type="button"
                @click="startRecording"
              >
                <Mic :size="18" /> Record
              </button>
              <button v-else class="danger-button" type="button" @click="stopRecording">
                <CircleStop :size="18" /> Stop
              </button>
            </div>
          </div>

          <div v-if="activeVoice" class="voice-card">
            <div class="voice-icon"><AudioLines :size="24" /></div>
            <div>
              <strong>{{ activeVoice.name }}</strong>
              <span>{{ activeVoice.type }} - {{ formatBytes(activeVoice.size) }}</span>
            </div>
            <audio :src="activeVoice.url" controls></audio>
          </div>
        </section>

        <section class="panel form-panel" aria-labelledby="knowledge-title">
          <div class="panel-heading">
            <div>
              <p class="section-kicker"><BookOpenText :size="16" /> Knowledge base</p>
              <h2 id="knowledge-title">Give the receptionist business context</h2>
            </div>
          </div>

          <div class="field-grid">
            <label>
              <span>Receptionist name</span>
              <input v-model="modelName" type="text" placeholder="Front desk assistant" />
            </label>
            <label>
              <span>Speaking style</span>
              <select v-model="speakingStyle">
                <option>Warm and clear</option>
                <option>Confident and concise</option>
                <option>Calm and instructional</option>
                <option>Energetic and friendly</option>
              </select>
            </label>
          </div>

          <div class="document-row">
            <label class="document-upload">
              <FileText :size="22" />
              <span>Upload knowledge document</span>
              <small>TXT, MD, CSV, JSON, PDF, DOC, or DOCX</small>
              <input
                type="file"
                accept=".txt,.md,.csv,.json,.pdf,.doc,.docx,text/*,application/pdf"
                @change="onDocumentChange"
              />
            </label>
            <div v-if="documentFile" class="document-card">
              <button class="icon-button" type="button" title="Remove document" @click="removeDocument">
                <X :size="16" />
              </button>
              <strong>{{ documentFile.name }}</strong>
              <span>{{ formatBytes(documentFile.size) }}</span>
              <small>{{ documentStatus }}</small>
            </div>
          </div>

          <label>
            <span>Knowledge base</span>
            <textarea
              v-model="knowledgeBase"
              rows="7"
              placeholder="Paste services, hours, appointment rules, FAQs, escalation steps, pricing, or location details."
            ></textarea>
          </label>

          <label class="question-field">
            <span>Visitor question or command</span>
            <div class="question-input">
              <textarea
                v-model="visitorQuestion"
                rows="4"
                placeholder="Ask what a visitor or caller would say, for example: Can I book an appointment tomorrow?"
              ></textarea>
              <button
                class="mic-button"
                type="button"
                :title="isListening ? 'Stop voice command' : 'Speak visitor command'"
                @click="isListening ? stopCommandListening() : startCommandListening()"
              >
                <CircleStop v-if="isListening" :size="18" />
                <Mic v-else :size="18" />
              </button>
            </div>
          </label>

          <button
            class="generate-button"
            type="button"
            :disabled="!canGenerate || isGenerating"
            @click="generatePreview"
          >
            <WandSparkles :size="19" />
            {{ isGenerating ? 'Preparing answer...' : 'Answer as receptionist' }}
          </button>
        </section>
      </div>

      <section class="output-band" aria-live="polite">
        <div class="output-copy">
          <p class="section-kicker"><Play :size="16" /> Receptionist answer</p>
          <h2>{{ generatedScript ? 'Answer ready' : 'Waiting for a visitor question' }}</h2>
          <p>
            {{
              generatedScript ||
              'The receptionist will answer the visitor question using the knowledge base and uploaded document, instead of reading the entire source content aloud.'
            }}
          </p>
          <button
            v-if="generatedScript"
            class="speak-button"
            type="button"
            @click="isSpeaking ? stopSpeaking() : speakPreview()"
          >
            <Volume2 :size="18" />
            {{ isSpeaking ? 'Stop answer' : 'Play answer' }}
          </button>
        </div>
        <div class="signal-visual" :class="{ active: generatedScript || isGenerating || isSpeaking }">
          <MessageCircleQuestion :size="34" />
          <span></span><span></span><span></span><span></span><span></span><span></span>
        </div>
      </section>
    </section>
  </main>
</template>
