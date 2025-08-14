/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // Add other env variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Global variables defined in vite config
declare const __APP_VERSION__: string;
declare const __BUILD_TIME__: string;
