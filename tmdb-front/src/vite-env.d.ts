/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_TMDB_API_BASE_URL: string
  readonly VITE_TMDB_API_KEY: string
  readonly VITE_TMDB_BEARER_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
