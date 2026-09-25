// macOS 专用导入
#[cfg(target_os = "macos")]
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial, NSVisualEffectState};

// Windows 专用导入
#[cfg(target_os = "windows")]
use window_vibrancy::{apply_acrylic, apply_blur, apply_mica};

// Manager trait 提供 get_webview_window 方法
use tauri::Manager;

#[tauri::command]
async fn fetch_netease_lyrics(song_id: String) -> Result<String, String> {
    let url = format!(
        "https://music.163.com/api/song/lyric?id={}&lv=1&kv=1&tv=1&yv=1&rv=1",
        song_id
    );
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(5))
        .build()
        .map_err(|e| e.to_string())?;

    let resp = client
        .get(&url)
        .header(
            "User-Agent",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        )
        .header("Referer", "https://music.163.com/")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let status = resp.status();
    if !status.is_success() {
        return Err(format!("HTTP status error: {}", status));
    }

    let text = resp.text().await.map_err(|e| e.to_string())?;
    Ok(text)
}

#[tauri::command]
async fn fetch_netease_get(endpoint: String) -> Result<String, String> {
    let url = if endpoint.starts_with("http") {
        endpoint
    } else {
        format!("https://music.163.com{}", endpoint)
    };
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(8))
        .build()
        .map_err(|e| e.to_string())?;

    let resp = client
        .get(&url)
        .header(
            "User-Agent",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        )
        .header("Referer", "https://music.163.com/")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let status = resp.status();
    if !status.is_success() {
        return Err(format!("HTTP status error: {}", status));
    }

    let text = resp.text().await.map_err(|e| e.to_string())?;
    Ok(text)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![fetch_netease_lyrics, fetch_netease_get])
        .setup(|app| {
            // 开发环境启用日志
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // 应用系统级毛玻璃
            let window = app.get_webview_window("main").unwrap();

            #[cfg(target_os = "macos")]
            {
                match apply_vibrancy(
                    &window,
                    NSVisualEffectMaterial::HudWindow,
                    Some(NSVisualEffectState::Active),
                    Some(12.0),
                ) {
                    Ok(_) => println!("[vibrancy] macOS vibrancy applied successfully"),
                    Err(e) => eprintln!("[vibrancy] macOS vibrancy failed: {:?}", e),
                }
            }

            #[cfg(target_os = "windows")]
            {
                // Windows 10/11 首选 Acrylic（兼容性更好）
                match apply_acrylic(&window, Some((18, 18, 18, 125))) {
                    Ok(_) => {
                        println!("[vibrancy] Windows Acrylic applied successfully");
                    }
                    Err(e) => {
                        eprintln!("[vibrancy] Acrylic failed: {:?}, trying Mica...", e);
                        // Win11 备选 Mica
                        match apply_mica(&window, None) {
                            Ok(_) => println!("[vibrancy] Windows Mica applied successfully"),
                            Err(e2) => {
                                eprintln!("[vibrancy] Mica also failed: {:?}, trying Blur...", e2);
                                // 最后兜底用 Blur
                                match apply_blur(&window, Some((18, 18, 18, 125))) {
                                    Ok(_) => println!("[vibrancy] Windows Blur applied successfully"),
                                    Err(e3) => eprintln!("[vibrancy] All vibrancy methods failed: {:?}", e3),
                                }
                            }
                        }
                    }
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}