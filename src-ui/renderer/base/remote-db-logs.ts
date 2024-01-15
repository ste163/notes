import { logs } from 'logger'

function renderRemoteDbLogs(container: Element) {
  // todo: based on logs '[type]' could assign color-coding

  if (logs.length)
    container.innerHTML = logs
      .map((log) => `<p>${log}</p>`)
      .reduce((acc, curr) => acc + curr)
}

export { renderRemoteDbLogs }
