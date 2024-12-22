use tauri::Manager;
use window_vibrancy::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
  .setup(|app| {
    #[cfg(desktop)]
    app.handle().plugin(tauri_plugin_updater::Builder::new().build())?;

    let window = app.get_webview_window("main").unwrap();

    #[cfg(target_os = "macos")]
    apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None)
        .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");

    #[cfg(target_os = "windows")]
    apply_mica(&window, Some((18, 18, 18, 125)))
        .expect("Unsupported platform! 'apply_mica' is only supported on Windows");


    Ok(())
  })
  .plugin(tauri_plugin_shell::init())
  .run(tauri::generate_context!())
  .expect("error while running tauri application");
}