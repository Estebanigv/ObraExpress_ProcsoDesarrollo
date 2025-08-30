// Declaración de tipos para el widget de ElevenLabs
declare namespace JSX {
  interface IntrinsicElements {
    'elevenlabs-convai': {
      'agent-id': string;
      children?: React.ReactNode;
    };
  }
}

// Declaración global para el objeto ElevenLabs si existe
declare global {
  interface Window {
    ElevenLabs?: any;
  }
}

export {};