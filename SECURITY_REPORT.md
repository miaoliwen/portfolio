# Aether Portfolio Security Report

审计时间：2026-04-20  
审计范围：根项目、`1/` 静态页面与 Node 静态服务器、`parchment-diary/` 子项目  
审计方式：代码静态审阅 + 配置检查 + 依赖面检查

## 一、结论摘要

这个仓库目前更接近“静态前端展示站 + 浏览器端工具 + 实验性子项目”，没有发现明显的远程代码执行、服务端注入或鉴权绕过类高危漏洞。

但仍存在几类值得优先处理的安全问题：

1. `parchment-diary` 将用户日记内容明文长期存储在 `localStorage`，属于隐私泄露风险。
2. 主站与独立静态页均缺少 CSP、HSTS、`X-Frame-Options` 等基础安全响应头，容易放大 XSS、点击劫持和资源注入类风险。
3. 开发服务器默认监听 `0.0.0.0`，如果在不受信任网络中运行，会扩大调试环境暴露面。
4. `1/app.js` 依赖 `innerHTML` 拼接 DOM，虽然目前做了转义，但实现脆弱，后续修改时很容易退化为真实 XSS。
5. 无法完成在线依赖漏洞数据库审计，当前供应链风险状态不能完全确认。

## 二、风险明细

### High

#### 1. `parchment-diary` 明文存储日记内容到 `localStorage`

- 证据：
  - `parchment-diary/src/App.tsx:15`
  - `parchment-diary/src/App.tsx:20`
- 代码行为：
  - 启动时直接读取 `localStorage.getItem('parchment_diary_entries')`
  - 内容变更后直接 `localStorage.setItem(...)`
- 风险：
  - `localStorage` 对当前源下的任意脚本可读。
  - 一旦站点未来引入 XSS、第三方脚本或浏览器扩展被滥用，用户日记内容会被直接读取。
  - 数据长期驻留浏览器，设备共用或被他人接触时也容易泄露。
- 影响：
  - 对隐私型内容尤其敏感，属于真实数据暴露面，不只是理论问题。
- 修复建议：
  - 最优：不要默认持久化敏感文本，改成“会话内内存保存 + 用户显式导出”。
  - 若必须持久化：使用用户口令派生密钥，在浏览器端通过 Web Crypto API 做 AES-GCM 加密后再存储。
  - 增加“清空本地数据”入口，并在 UI 中明确告知“内容保存在本机浏览器”。
  - 设置过期策略，例如 7 天或 30 天自动清理。

### Medium

#### 2. 缺少基础安全响应头

- 证据：
  - `vercel.json:2-5` 只有 rewrite，没有 headers
  - `index.html:5` 仅设置了 `Content-Language`
  - `1/server.cjs:68` 返回 200 响应时只设置 `Content-Type`
- 风险：
  - 缺少 `Content-Security-Policy` 会降低浏览器对脚本注入的防护能力。
  - 缺少 `X-Frame-Options` / `frame-ancestors` 会增加点击劫持风险。
  - 缺少 `X-Content-Type-Options: nosniff` 会增加 MIME 嗅探风险。
  - 缺少 `Strict-Transport-Security` 会削弱 HTTPS 强制能力。
- 修复建议：
  - 在 Vercel 层为主站配置统一安全头。
  - 若 `1/server.cjs` 仍要保留，也应补齐相同头部。
  - 推荐最小集合：

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; img-src 'self' data: https:; media-src 'self' https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; script-src 'self'; connect-src 'self'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'"
        }
      ]
    }
  ]
}
```

#### 3. 独立静态页 `1/app.js` 使用 `innerHTML` 渲染

- 证据：
  - `1/app.js:438`
  - `1/app.js:482`
  - `1/app.js:517`
- 当前状态：
  - 这份代码对主要用户输入调用了 `escapeHtml()`，因此当前版本不是直接可利用的显性 XSS。
- 风险：
  - 该模式本身脆弱，后续只要新增一个未转义字段、属性、URL、事件处理器片段，就可能演变成 XSS。
  - `innerHTML` 的安全依赖“开发者每次都记得转义”，长期维护风险较高。
- 修复建议：
  - 将预览和结果区域改成 DOM API 创建节点，或直接迁移到 React 渲染。
  - 如果必须保留 HTML 模板，至少把模板渲染集中到单一安全函数里，并对所有动态值统一做上下文安全编码。
  - 对 `generatedImageContainer` 这种简单场景，优先使用 `createElement('img')` + `img.src = ...`。

#### 4. 静态服务器没有任何速率限制或安全头

- 证据：
  - `1/server.cjs:39-70`
- 当前状态：
  - 已做路径规范化，`getSafeFilePath()` 使用 `path.resolve()` + `path.relative()`，目录穿越防护思路是正确的。
- 风险：
  - 服务器仅适合作为本地开发/演示用途。
  - 若误用于公网，将缺少访问控制、缓存策略、安全头、速率限制与日志审计。
- 修复建议：
  - 明确标注“仅本地使用，不用于生产”。
  - 若要上线，建议直接交给 Vercel/Nginx/Cloudflare 等托管静态资源。
  - 若必须保留 Node 服务，至少补充：
    - 安全响应头
    - 基础请求日志
    - 简单的 IP 速率限制
    - 明确的缓存控制

### Low

#### 5. 开发服务监听 `0.0.0.0`

- 证据：
  - `package.json:7`
  - `parchment-diary/package.json:7`
- 风险：
  - 在公司网、校园网或共享 Wi‑Fi 中运行时，同网段设备可能直接访问你的开发站点。
  - 若未来引入调试接口、源码映射、临时管理页，这类暴露面会变得更危险。
- 修复建议：
  - 默认改为 `vite --port=3000 --host=127.0.0.1`
  - 仅在确有移动设备联调需求时，通过单独脚本启用 `0.0.0.0`，例如：

```json
{
  "scripts": {
    "dev": "vite --port=3000 --host=127.0.0.1",
    "dev:lan": "vite --port=3000 --host=0.0.0.0"
  }
}
```

#### 6. 主项目虽然加入了 `safeSetItem`，但它不是隐私保护机制

- 证据：
  - `src/lib/storage.ts:18-54`
  - `src/lib/storage.ts:173-191`
- 风险：
  - 当前实现只是基于关键词和长度做启发式阻止，无法替代真正的敏感数据分级和加密。
  - `getStorageReport()` 会暴露本地存储项的预览内容，如果未来被接入调试页，可能导致敏感信息二次泄露。
- 修复建议：
  - 将此工具定位为“误存储保护”，不要把它当成安全边界。
  - 为调试函数增加仅开发环境可用的限制。
  - 若未来要存储用户生成内容，优先定义白名单键名，而不是黑名单拦截。

## 三、正向发现

以下实现对安全是有帮助的：

- `.gitignore` 已忽略 `.env*`，并保留 `.env.example` 模板，方向正确。
- `1/server.cjs` 对路径做了解码异常处理与目录穿越校验，优于很多临时静态服务器实现。
- `1/app.js` 在主要文本拼接处调用了 `escapeHtml()`，说明作者有 XSS 防护意识。
- `src/components/Footer.tsx` 的外链使用了 `rel="noreferrer"`，可降低部分 `target="_blank"` 场景风险。
- React 主站没有看到 `dangerouslySetInnerHTML`，默认受益于 React 的自动转义。

## 四、建议修复优先级

### P1：建议本周完成

1. 处理 `parchment-diary` 的本地明文存储问题。
2. 为 Vercel 和静态服务器补充统一安全头。
3. 把开发脚本默认监听地址从 `0.0.0.0` 改为 `127.0.0.1`。

### P2：建议随后完成

1. 将 `1/app.js` 的 `innerHTML` 渲染改为安全 DOM API。
2. 为本地存储增加数据保留期限与清除入口。
3. 在 README 中注明 `1/server.cjs` 仅供本地演示。

### P3：持续治理

1. 接入 Dependabot 或 Renovate。
2. 在 CI 中增加 `npm audit`、`npm outdated`、`tsc --noEmit`。
3. 增加简单的安全检查清单：CSP、依赖漏洞、第三方域名、localStorage 使用点。

## 五、依赖与审计限制

我尝试对根项目和 `parchment-diary` 运行 `npm audit`，但当前环境无法成功访问审计接口，因此没有拿到权威漏洞清单。

失败现象：

- `npm audit` 请求 `https://registry.npmmirror.com/-/npm/v1/security/advisories/bulk` 失败

因此本报告里的“依赖安全”部分是保守判断，不等于“当前依赖完全无漏洞”。建议你在可联网环境执行：

```bash
npm audit --registry=https://registry.npmjs.org
cd parchment-diary && npm audit --registry=https://registry.npmjs.org
```

## 六、落地方案示例

### 1. 浏览器端加密存储敏感文本

- 用户输入口令
- 使用 `PBKDF2`/`scrypt` 派生密钥
- 用 `AES-GCM` 加密日记内容
- 仅把密文、salt、iv 存到 `localStorage`

### 2. 安全头基线

- 主站：通过 `vercel.json` 统一设置
- Node 静态服务器：通过 `res.writeHead()` 统一追加

### 3. 前端数据最小化

- 主站只保存语言偏好这类低敏信息
- 用户生成文本默认不持久化
- 确需保存时，提供显式同意和清除机制

## 七、最终判断

这个仓库当前的主要风险不是“已经存在可直接打穿的严重漏洞”，而是“作为个人前端项目，一旦继续叠加功能或放到公网，现有安全基线偏弱”。  
如果只做静态展示，风险总体可控；如果准备长期运营、收集用户内容、或继续扩展子项目功能，建议先补齐本报告中的 P1 项。
