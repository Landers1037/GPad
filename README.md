# GPad

GPad 是一个基于 `Electron + electron-vite + React + Tailwind CSS` 的桌面管理器，用于统一管理 `Moonlight` 与 `Traversal` 的配置、进程状态和应用设置。

## 开发命令

```bash
# 安装依赖
npm install

# 启动 Electron 开发环境
npm run dev

# 构建主进程、preload 与 renderer
npm run build

# 打包 Windows 发行版本
npm run dist
```

## 项目结构

```text
├── exe/                       # 受管程序与配置文件
├── src/
│   ├── electron/
│   │   ├── main/              # Electron 主进程
│   │   └── preload/           # 安全桥接层
│   ├── mainview/              # React 渲染层
│   └── shared/                # 共享类型、元信息与 IPC 协议
├── electron.vite.config.ts    # Electron Vite 配置
├── tailwind.config.js         # Tailwind 主题配置
└── package.json
```

## 功能概览

- 首页展示两个受管程序的运行状态、PID、CPU、内存、运行时长、当前时间与端口占位信息
- `/moonlight` 页面支持查看和编辑 `config.json`，并控制 `web-server.exe`
- `/traversal` 页面支持查看和编辑 `traversalc.json`，并控制 `hamburger_traversalc.exe`
- `/setting` 页面支持主题配色、语言、日志路径与日志级别设置
- `/about` 页面展示程序用途、技术栈与版本号
