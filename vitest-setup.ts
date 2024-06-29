import { vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

// database provider should always be mocked
vi.mock('pouchdb-browser')
