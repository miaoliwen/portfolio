# 项目解耦说明

## 已完成的解耦操作

### 主项目 (aether-portfolio)

1. **移除构建依赖**
   - 删除 `package.json` 中的 `build:study` 脚本
   - `build` 脚本不再包含子项目构建

2. **移除导航链接**
   - `src/components/Navbar.tsx` 中移除 `/study` 链接

3. **移除翻译条目**
   - `src/lib/translations.ts` 中移除 `study` 相关翻译

4. **移除路由配置**
   - `vercel.json` 中移除 `/study` 路由重写

5. **删除构建产物**
   - 删除 `public/study` 目录

6. **更新 .gitignore**
   - 添加 `ai英语解题助手/` 排除规则

### 子项目 (ai英语解题助手)

1. **独立构建配置**
   - `vite.config.ts`: 移除 `base: '/study/'`
   - `vite.config.ts`: 输出目录改为 `dist`（不再输出到 `../public/study`）
   - 开发服务器端口改为 `3001`

2. **独立路由配置**
   - `src/router/index.ts`: 移除 `/study/` 前缀

3. **新增独立文件**
   - `README.md`: 项目文档
   - `vercel.json`: 独立部署配置

## 后续步骤

### 1. 复制子项目到独立仓库

```bash
# 复制整个目录
cp -r ai英语解题助手 ~/projects/ai-english-helper

# 或者移动
mv ai英语解题助手 ~/projects/ai-english-helper
```

### 2. 初始化独立 Git 仓库

```bash
cd ~/projects/ai-english-helper
git init
git add .
git commit -m "Initial commit: AI English Helper"
```

### 3. 部署到 Vercel

```bash
cd ~/projects/ai-english-helper
vercel --prod
```

### 4. (可选) 更新主项目链接

如果需要在主项目中添加指向独立部署的链接：

```typescript
// src/lib/translations.ts
nav: {
  // ...
  study: "解题助手",  // 取消注释
}

// src/components/Navbar.tsx
{ name: t.nav.study, href: "https://your-study-app.vercel.app" },
```

## 独立运行

### 子项目

```bash
cd ai英语解题助手
npm install
npm run dev  # http://localhost:3001
```

### 主项目

```bash
cd aether-portfolio
npm install
npm run dev  # http://localhost:3000
```

## 验证清单

- [x] 主项目 `npm run build` 成功
- [x] 主项目 `npm run lint` 通过
- [x] 子项目可独立运行
- [x] 无交叉依赖
- [x] 路由配置独立
