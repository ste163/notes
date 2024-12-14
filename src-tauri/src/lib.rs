use tauri_plugin_updater::UpdaterExt;

// this rust code related to the updater does not run on the production build, only dev.
// attempt to remove and use the JS updater implementation instead of rust
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
    .setup(|app| {
      let handle = app.handle().clone();
      tauri::async_runtime::spawn(async move {
          if let Err(e) = update(handle).await {
              eprintln!("Update failed: {:?}", e);
          }
      });
      Ok(())
  })
    .run(tauri::generate_context!())
    .unwrap();
}

async fn update(app: tauri::AppHandle) -> tauri_plugin_updater::Result<()> {
    if let Some(update) = app.updater()?.check().await? {
      let mut downloaded = 0;
  
      // alternatively we could also call update.download() and update.install() separately
      update
        .download_and_install(
          |chunk_length, content_length| {
            downloaded += chunk_length;
            println!("downloaded {downloaded} from {content_length:?}");
          },
          || {
            println!("download finished");
          },
        )
        .await?;
  
      println!("update installed");
      app.restart();
    }

    Ok(())
  }