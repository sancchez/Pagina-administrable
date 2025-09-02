/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DEV: boolean
  readonly PROD: boolean
  readonly MODE: string
  readonly BASE_URL: string
  // Agregar más variables de entorno según sea necesario
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}