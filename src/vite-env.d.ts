/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
}

interface Window {
  __API_BASE_URL__?: string;
}

declare const __APP_VERSION__: string;
