function renderRemoteDbLogs(container: Element, logs: string[]) {
  // TODO: based on logs '[type]' assign color coding (errors are an accessible red)
  if (logs.length)
    container.innerHTML = logs
      .map((log) => `<p>${log}</p>`)
      .reduce((acc, curr) => acc + curr)
  // set logs to always scroll to bottom, so most recent is in view
  container.scrollTop = container?.scrollHeight
}

export { renderRemoteDbLogs }
