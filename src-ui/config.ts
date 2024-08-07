const config = {
  BASE_URL: import.meta.env.VITE_BASE_URL ?? '/',
  DATABASE_NAME: import.meta.env.VITE_DATABASE_NAME ?? '',
  MODE: import.meta.env.VITE_MODE ?? 'web',
}

export { config }
