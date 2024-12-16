#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
  .setup(|app| {
    #[cfg(desktop)]
    app.handle().plugin(tauri_plugin_updater::Builder::new().build())?;
    Ok(())
  })
  .plugin(tauri_plugin_shell::init())
  .run(tauri::generate_context!())
  .expect("error while running tauri application");
}