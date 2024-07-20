async function clearIndexDb() {
  const indexedDBs = await indexedDB.databases()
  indexedDBs.forEach(({ name }) => name && indexedDB.deleteDatabase(name))
}

export { clearIndexDb }
