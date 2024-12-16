import { check } from '@tauri-apps/plugin-updater'
// import { relaunch } from '@tauri-apps/plugin-process'
import { logger } from 'logger'

// Note: this code comes from Tauri docs for setting up basic update functionality
const checkForUpdate = async () => {
  try {
    const update = await check()

    if (!update) {
      logger.log('info', 'Running latest version. No updates found.')
      return
    }

    logger.log(
      'info',
      `found update ${update.version} from ${update.date} with notes ${update.body}`
    )

    let downloaded = 0
    let contentLength = 0
    // alternatively we could also call update.download() and update.install() separately
    await update.downloadAndInstall((event) => {
      switch (event.event) {
        case 'Started':
          if (event.data.contentLength) contentLength = event.data.contentLength
          logger.log(
            'info',
            `started downloading ${event.data.contentLength} bytes`
          )
          break
        case 'Progress':
          downloaded += event.data.chunkLength
          logger.log('info', `downloaded ${downloaded} from ${contentLength}`)
          break
        case 'Finished':
          logger.log('info', 'download finished')
          break
      }
    })
    logger.log('info', 'update installed')
    console.log('update installed')
    //   await relaunch()
  } catch (error) {
    logger.log('error', 'Error in tauri updater', error)
  }
}

export { checkForUpdate }
