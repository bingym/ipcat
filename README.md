# IPCat

基于 Cloudflare Worker 的 IP 地址查询工具，使用 [IP2Location.io](https://www.ip2location.io/) API。

## 功能

- 自动查询访问者 IP 信息
- 支持手动输入 IP 查询
- 显示地理位置、网络、运营商、安全检测等详细信息

## 开发

```bash
# 安装依赖
npm install

# 设置 API Key（本地开发）
# 创建 .dev.vars 文件并写入：
# IP2LOCATION_KEY=your_key_here

# 启动开发服务器
npm run dev
```

## 部署

```bash
# 设置 API Key（生产环境 secret）
npx wrangler secret put IP2LOCATION_KEY

# 部署到 Cloudflare
npm run deploy
```

## API

### 查询 IP 信息

`GET /api/lookup?ip=8.8.8.8`

省略 `ip` 参数时返回请求者自身的 IP 信息。
