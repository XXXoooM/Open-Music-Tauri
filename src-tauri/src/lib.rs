// macOS 专用导入
#[cfg(target_os = "macos")]
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial, NSVisualEffectState};

// Windows 专用导入
#[cfg(target_os = "windows")]
use window_vibrancy::{apply_acrylic, apply_blur, apply_mica};

// Manager trait 提供 get_webview_window 方法
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
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