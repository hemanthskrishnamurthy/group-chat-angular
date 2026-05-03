export type ParsedJson = {
  valid: boolean;
  data: unknown;
  error: string;
};

export type ActiveVoice = {
  name: string;
  type: string;
  size: number;
  url: string;
};

export type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

export type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export type SpeechRecognitionResultEventLike = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

export const KNOWLEDGE_FILE_EXTENSIONS = ['txt', 'doc', 'docx', 'pdf', 'json'] as const;
export const KNOWLEDGE_FILE_ACCEPT = '.txt,.doc,.docx,.pdf,.json,text/plain,application/json,application/pdf';
