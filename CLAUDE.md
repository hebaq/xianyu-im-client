# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 Electron + Vue 3 + TypeScript 的闲鱼聊天客户端，支持多账号管理、消息提醒、自动回复等功能。项目使用 electron-vite 作为构建工具。

## 开发命令

### 环境和依赖
```bash
# 安装依赖（使用 Yarn）
yarn install

# 安装应用依赖
yarn postinstall
```

### 开发调试
```bash
# 开发模式启动
yarn dev

# 预览模式启动
yarn start
```

### 代码质量检查
```bash
# 格式化代码
yarn format

# ESLint 检查和修复
yarn lint

# 类型检查
yarn typecheck

# 单独检查主进程
yarn typecheck:node

# 单独检查渲染进程
yarn typecheck:web
```

### 构建和打包
```bash
# 完整构建（包含类型检查）
yarn build

# 构建并打包为目录格式
yarn build:unpack

# 构建 Windows 安装包
yarn build:win

# 构建 macOS 安装包
yarn build:mac

# 构建 Linux 安装包
yarn build:linux
```

## 项目架构

### 目录结构
- `src/main/` - Electron 主进程代码
- `src/preload/` - 预加载脚本
- `src/renderer/` - Vue 3 渲染进程（前端界面）
- `src/shared/` - 主进程和渲染进程共享的类型定义

### 核心组件架构

#### 主进程服务层 (src/main/service/)
- `im.service.ts` - 闲鱼即时通讯核心服务，负责 WebSocket 连接和消息处理
- `msg.service.ts` - 消息处理服务，基于中间件模式实现可扩展的消息处理链
- `api.service.ts` - 闲鱼 API 调用服务
- `browser.service.ts` - 浏览器自动化服务（基于 Puppeteer）
- `user.service.ts` - 用户管理服务
- `store.service.ts` - 本地存储服务
- `window.service.ts` - 窗口管理服务
- `emitter.service.ts` - 事件发射器服务
- `send.service.ts` - 消息发送服务

#### 消息处理机制
消息处理采用中间件模式，在 `msg.service.ts` 中实现：
- `MsgLogHandler` - 消息日志记录
- `TextMsgHandler` - 文本消息处理和自动回复
- `ImageMsgHandler` - 图片消息处理

自定义消息处理逻辑可以通过创建新的 Handler 类并注册到 `msgService` 来实现。

#### IPC 通信
- `src/main/ipc.main.ts` - 主进程 IPC 事件处理
- `src/renderer/src/utils/ipc-*.ts` - 渲染进程 IPC 工具

#### 类型系统
- `src/shared/types/index.ts` - 共享类型定义（用户、事件等）
- `src/main/types/index.ts` - 主进程特有类型（消息格式等）

### 前端架构 (src/renderer/)
- Vue 3 + TypeScript + Vue Router
- PrimeVue UI 组件库
- UnoCSS 原子化 CSS
- 组件自动导入配置

### 技术栈特点
- **加密通信**: 使用 `xianyu_js_version_2.cjs` 进行消息加解密
- **浏览器自动化**: 集成 Puppeteer 用于自动化操作
- **托盘应用**: 支持系统托盘，消息闪烁提醒
- **多账号支持**: 支持同时管理多个闲鱼账号
- **WebSocket 连接**: 与闲鱼服务器建立 WSS 连接进行实时通信

## 关键配置文件

- `electron.vite.config.ts` - Electron Vite 构建配置
- `electron.builder.json` - Electron Builder 打包配置
- `uno.config.ts` - UnoCSS 配置
- `eslint.config.mjs` - ESLint 配置
- `tsconfig.*.json` - TypeScript 配置（分别针对主进程、渲染进程、Node.js）

## 调试和开发注意事项

1. 项目启用了 Chrome DevTools 调试端口 (配置在 `src/main/config/index.ts`)
2. 主进程使用 Puppeteer 进行浏览器自动化，需要注意 Chrome 实例的生命周期管理
3. 消息加解密逻辑依赖于 `libs/` 目录下的 JavaScript 模块
4. IPC 通信事件定义在共享类型中，修改时需要同步更新主进程和渲染进程
5. 自动回复逻辑在 `TextMsgHandler.handle()` 方法中，可以根据消息内容自定义回复策略

## 构建注意事项

- 项目使用 Yarn 作为包管理器
- 构建前会自动执行类型检查
- Windows 打包需要配置相应的证书和签名（如果需要）
- 资源文件放在 `resources/` 目录下，构建时会自动复制