const config = {
  DATABASE_NAME: import.meta.env.VITE_DATABASE_NAME ?? '',
  BASE_URL: import.meta.env.VITE_BASE_URL ?? '/',
}

export { config }
