import type { ViewportSize } from '@playwright/test'

export const dimensions: Record<'small' | 'medium' | 'large', ViewportSize> = {
  small: { width: 375, height: 667 },
  medium: { width: 768, height: 1024 },
  large: { width: 1920, height: 1080 },
}
