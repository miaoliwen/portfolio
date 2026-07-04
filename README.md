# Aether Portfolio

一个以视觉表现和交互动效为核心的个人作品集网站，基于 React + Vite + Tailwind CSS 构建，支持中英文切换，包含摄影作品展示、个人介绍、常用软件推荐，以及请假条生成工具。

## 项目特性

- 现代前端技术栈：React 19 + TypeScript + Vite。
- Tailwind CSS v4 主题化设计，默认强制深色模式。
- 使用 motion 构建页面入场、滚动触发和交互动画。
- 内置中英双语：自动识别浏览器语言并持久化到 localStorage。
- 模块化页面结构：导航、Hero、About、Projects、Experience、LeaveNote、Footer。
- 图片画廊支持灯箱预览、键盘导航和懒加载状态。
- 请假条生成器支持表单输入、时长计算与图片导出。

## 技术栈

- 框架：React 19
- 语言：TypeScript
- 构建工具：Vite 6
- 样式：Tailwind CSS v4、tw-animate-css、shadcn 基础样式
- 动画：motion
- 图标：lucide-react
- 字体：Geist Variable

## 快速开始

### 1. 环境要求

- Node.js 18+
- npm 9+

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发环境

```bash
npm run dev
```

默认会在 `127.0.0.1:3000` 启动开发服务器（仅本机访问）。如需局域网联调，使用 `npm run dev:lan` 监听 `0.0.0.0`。

### 4. 生产构建与预览

```bash
npm run build
npm run preview
```

### 5. 类型检查

```bash
npm run lint
```

当前 `lint` 实际执行的是 TypeScript 类型检查（`tsc --noEmit`）。

## 可用脚本

- `npm run dev`：启动 Vite 开发服务器（端口 3000）。
- `npm run build`：打包生产版本。
- `npm run preview`：本地预览生产构建产物。
- `npm run lint`：执行 TypeScript 类型检查。
- `npm run clean`：删除 `dist` 目录（在 Windows PowerShell 中可考虑改为跨平台命令）。

## 目录结构

```text
aether-portfolio/
├─ src/
│  ├─ App.tsx                    # 页面组合入口
│  ├─ main.tsx                   # React 挂载入口
│  ├─ index.css                  # 全局样式与主题变量
│  ├─ components/
│  │  ├─ Navbar.tsx              # 顶部导航与社交入口
│  │  ├─ Hero.tsx                # 首屏
│  │  ├─ About.tsx               # 个人介绍
│  │  ├─ Projects.tsx            # 摄影画廊（含灯箱）
│  │  ├─ Experience.tsx          # 常用软件推荐
│  │  ├─ LeaveNote.tsx           # 请假条生成工具
│  │  └─ Footer.tsx              # 页脚
│  └─ lib/
│     ├─ LanguageContext.tsx     # 语言状态管理
│     └─ translations.ts         # 中英文文案
├─ components/ui/                # 通用 UI 组件
├─ public/images/                # 静态资源
├─ touxiang/                     # 头像资源
├─ 1/                            # 独立静态版请假条页面与 Node 静态服务示例
├─ vite.config.ts                # Vite 配置（含别名和构建优化）
├─ tsconfig.json                 # TypeScript 配置
└─ package.json                  # 依赖与脚本
```

## 页面与模块说明

- `LanguageProvider`：
   - 初始化语言优先级：localStorage > 浏览器语言 > 中文。
   - 自动同步 `<html lang>` 与 `Content-Language`。
- `Projects`：
   - 本地图片列表展示。
   - 灯箱支持 ESC 关闭、左右键切换、背景滚动锁定。
- `LeaveNote`：
   - 自动计算请假时长。
   - 支持按中文/英文模板生成请假文本。
   - 可生成图片预览并导出。


## 二次开发建议

- 更新多语言文案：编辑 `src/lib/translations.ts`。
- 新增页面区块：在 `src/components` 新建组件并在 `src/App.tsx` 组合。
- 调整视觉主题：修改 `src/index.css` 中的 CSS 变量（`--background`、`--primary` 等）。
- 添加新图片：将资源放入 `public/images` 并在 `src/components/Projects.tsx` 的 `galleryImages` 中登记。

## 兼容性与注意事项

- 项目依赖 Vite 与现代浏览器特性，建议使用最新版 Chrome / Edge / Safari / Firefox。
- `npm run clean` 使用了 Unix 风格命令 `rm -rf`，在 Windows 原生命令行中可能不可用。
- 仓库中存在 `BounceButton.test.tsx`，但 `package.json` 当前未配置 `test` 脚本；如需启用测试，建议补充 Vitest 配置与命令。

## 额外说明

- 根目录 `1/` 下包含一个独立的静态实现（`index.html + app.js + server.cjs`），与 `src/` 下的 React 主站为并存关系，可按需保留或拆分。
