# Open Music Tauri

> Apple Music 风格的桌面音乐播放器，基于 Tauri 2.0 + React 19 构建。

## 技术栈

- **桌面框架**：Tauri 2.0
- **前端**：React 19 + TypeScript 5
- **构建**：Vite 7
- **样式**：Tailwind CSS v4
- **状态管理**：Zustand v5
- **歌词**：@applemusic-like-lyrics
- **取色**：colorthief + @material/material-color-utilities

## 开发

```bash
pnpm install
pnpm dev          # 浏览器预览
pnpm dev:tauri    # Tauri 窗口
pnpm build        # 构建 Web 产物
pnpm build:tauri  # 打包桌面应用
```

## 特性

- 类 Apple Music 的沉浸式全屏播放页
- 从封面提取主色调生成动态渐变背景
- 逐字/逐行歌词滚动与高亮
- 系统级毛玻璃（Windows Acrylic / macOS Vibrancy）
- 全局键盘快捷键
- 支持 Web 和 Tauri 双端部署

## 项目结构

```
├── src/                  # React 前端
│   ├── components/       # UI 组件
│   ├── stores/           # Zustand 状态
│   ├── hooks/            # 自定义 hooks
│   ├── services/         # API 层
│   └── styles/           # 设计系统
├── src-tauri/            # Tauri Rust 后端
└── docs/                 # 文档与截图
```

## 许可证

待定（如果确定使用某许可证，请在仓库根目录添加 LICENSE 文件）
