import { test } from '../fixtures'

test('debug resize values', async ({ page }) => {
  await page.goto('/')
  const sidebarWidth = await page.locator('.sidebar-main').evaluate(el => getComputedStyle(el).width)
  console.log('Default sidebar width:', sidebarWidth)
  
  // drag handle to 400
  const handle = page.locator('[data-testid="sidebar-resize-handle"]')
  const box = await handle.boundingBox()
  await page.mouse.move(box!.x, box!.y)
  await page.mouse.down()
  await page.mouse.move(400, box!.y)
  await page.mouse.up()
  
  const afterDragWidth = await page.locator('.sidebar-main').evaluate(el => getComputedStyle(el).width)
  console.log('After drag to 400 sidebar width:', afterDragWidth)
})
