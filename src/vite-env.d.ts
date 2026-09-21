/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** SHA-256 hex hash of the app-lock PIN. Unset = lock disabled (open access). */
  readonly VITE_APP_PIN_HASH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
