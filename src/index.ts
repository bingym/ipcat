interface Env {
  IP2LOCATION_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/lookup") {
      return handleLookup(request, env);
    }

    if (url.pathname === "/" || url.pathname === "") {
      return new Response(HTML, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
};

async function handleLookup(
  request: Request,
  env: Env,
): Promise<Response> {
  const url = new URL(request.url);
  const queryIp = url.searchParams.get("ip")?.trim();
  const clientIp = request.headers.get("CF-Connecting-IP") ?? "";
  const ip = queryIp || clientIp;

  if (!ip) {
    return Response.json({ error: "无法获取 IP 地址" }, { status: 400 });
  }

  try {
    const apiUrl = `https://api.ip2location.io/?key=${env.IP2LOCATION_KEY}&ip=${encodeURIComponent(ip)}`;
    const resp = await fetch(apiUrl);

    if (!resp.ok) {
      return Response.json(
        { error: `ip2location API 返回 ${resp.status}` },
        { status: 502 },
      );
    }

    const data = await resp.json();
    return Response.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "未知错误";
    return Response.json({ error: message }, { status: 500 });
  }
}

const HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>IPCat - IP 地址查询</title>
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --bg: #0f172a;
    --surface: #1e293b;
    --surface-hover: #334155;
    --border: #334155;
    --text: #f1f5f9;
    --text-secondary: #94a3b8;
    --accent: #38bdf8;
    --accent-dim: #0ea5e9;
    --green: #4ade80;
    --red: #f87171;
    --yellow: #fbbf24;
    --radius: 12px;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    line-height: 1.6;
  }

  .container {
    max-width: 960px;
    margin: 0 auto;
    padding: 40px 20px;
  }

  header {
    text-align: center;
    margin-bottom: 40px;
  }

  header h1 {
    font-size: 2.5rem;
    font-weight: 800;
    background: linear-gradient(135deg, var(--accent), #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 8px;
  }

  header p {
    color: var(--text-secondary);
    font-size: 1.05rem;
  }

  .search-box {
    display: flex;
    gap: 12px;
    max-width: 560px;
    margin: 0 auto 40px;
  }

  .search-box input {
    flex: 1;
    padding: 14px 20px;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    font-size: 1rem;
    outline: none;
    transition: border-color 0.2s;
  }

  .search-box input::placeholder { color: var(--text-secondary); }
  .search-box input:focus { border-color: var(--accent); }

  .search-box button {
    padding: 14px 28px;
    border-radius: var(--radius);
    border: none;
    background: var(--accent);
    color: var(--bg);
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    white-space: nowrap;
  }

  .search-box button:hover { background: var(--accent-dim); }
  .search-box button:disabled { opacity: 0.5; cursor: not-allowed; }

  .loading {
    text-align: center;
    padding: 60px 0;
    color: var(--text-secondary);
    font-size: 1.1rem;
  }

  .loading .spinner {
    display: inline-block;
    width: 28px;
    height: 28px;
    border: 3px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-bottom: 12px;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .error-msg {
    text-align: center;
    padding: 24px;
    background: rgba(248, 113, 113, 0.1);
    border: 1px solid rgba(248, 113, 113, 0.3);
    border-radius: var(--radius);
    color: var(--red);
    margin-bottom: 20px;
  }

  .ip-hero {
    text-align: center;
    padding: 32px;
    background: var(--surface);
    border-radius: var(--radius);
    margin-bottom: 24px;
    border: 1px solid var(--border);
  }

  .ip-hero .ip-addr {
    font-size: 2rem;
    font-weight: 700;
    font-family: "SF Mono", "Fira Code", "Cascadia Code", monospace;
    color: var(--accent);
    margin-bottom: 8px;
  }

  .ip-hero .ip-location {
    font-size: 1.15rem;
    color: var(--text-secondary);
  }

  .ip-hero .ip-location .flag {
    display: inline-block;
    width: 24px;
    height: 18px;
    vertical-align: middle;
    margin-right: 6px;
    border-radius: 2px;
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }

  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 24px;
  }

  .card h3 {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-secondary);
    margin-bottom: 16px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border);
  }

  .field {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 6px 0;
  }

  .field .label {
    color: var(--text-secondary);
    font-size: 0.9rem;
    flex-shrink: 0;
    margin-right: 12px;
  }

  .field .value {
    font-weight: 500;
    text-align: right;
    word-break: break-all;
  }

  .badge {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .badge-safe {
    background: rgba(74, 222, 128, 0.15);
    color: var(--green);
  }

  .badge-warn {
    background: rgba(251, 191, 36, 0.15);
    color: var(--yellow);
  }

  .badge-danger {
    background: rgba(248, 113, 113, 0.15);
    color: var(--red);
  }

  .map-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    padding: 8px 16px;
    background: var(--surface-hover);
    border-radius: 8px;
    color: var(--accent);
    text-decoration: none;
    font-size: 0.9rem;
    transition: background 0.2s;
  }

  .map-link:hover { background: var(--border); }

  footer {
    text-align: center;
    margin-top: 48px;
    padding-top: 24px;
    border-top: 1px solid var(--border);
    color: var(--text-secondary);
    font-size: 0.85rem;
  }

  footer a { color: var(--accent); text-decoration: none; }

  @media (max-width: 480px) {
    .container { padding: 24px 16px; }
    header h1 { font-size: 1.8rem; }
    .search-box { flex-direction: column; }
    .search-box button { width: 100%; }
    .ip-hero .ip-addr { font-size: 1.5rem; }
  }
</style>
</head>
<body>
<div class="container">
  <header>
    <h1>IPCat</h1>
    <p>输入 IP 地址查询详细信息，留空则查询您当前的 IP</p>
  </header>

  <div class="search-box">
    <input id="ipInput" type="text" placeholder="请输入 IP 地址，如 8.8.8.8" autocomplete="off"
           spellcheck="false">
    <button id="searchBtn" onclick="doSearch()">查询</button>
  </div>

  <div id="result"></div>

  <footer>
    Powered by <a href="https://www.ip2location.io/" target="_blank">IP2Location.io</a>
  </footer>
</div>

<script>
const input = document.getElementById('ipInput');
const result = document.getElementById('result');
const btn = document.getElementById('searchBtn');

input.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });

doSearch();

async function doSearch() {
  const ip = input.value.trim();
  const qs = ip ? '?ip=' + encodeURIComponent(ip) : '';

  result.innerHTML = '<div class="loading"><div class="spinner"></div><div>正在查询...</div></div>';
  btn.disabled = true;

  try {
    const resp = await fetch('/api/lookup' + qs);
    const data = await resp.json();

    if (data.error) {
      const msg = typeof data.error === 'object' ? data.error.error_message : data.error;
      result.innerHTML = '<div class="error-msg">' + esc(msg) + '</div>';
      return;
    }

    render(data);
  } catch (e) {
    result.innerHTML = '<div class="error-msg">请求失败，请稍后重试</div>';
  } finally {
    btn.disabled = false;
  }
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function val(v) {
  if (v === null || v === undefined || v === '' || v === '-') return '<span style="color:var(--text-secondary)">—</span>';
  return esc(String(v));
}

function field(label, value) {
  return '<div class="field"><span class="label">' + esc(label) + '</span><span class="value">' + val(value) + '</span></div>';
}

function render(d) {
  const loc = [d.city_name, d.region_name, d.country_name].filter(Boolean).join(', ');
  const flagUrl = d.country_code
    ? 'https://cdn.ip2location.io/assets/img/flags/' + d.country_code.toLowerCase() + '.png'
    : '';
  const flagImg = flagUrl
    ? '<img class="flag" src="' + esc(flagUrl) + '" alt="' + esc(d.country_code) + '">'
    : '';

  let html = '';

  html += '<div class="ip-hero">';
  html += '<div class="ip-addr">' + esc(d.ip) + '</div>';
  html += '<div class="ip-location">' + flagImg + esc(loc) + '</div>';
  if (d.latitude && d.longitude) {
    html += '<a class="map-link" href="https://www.google.com/maps?q=' + d.latitude + ',' + d.longitude + '" target="_blank">';
    html += '📍 在地图上查看 (' + d.latitude + ', ' + d.longitude + ')</a>';
  }
  html += '</div>';

  html += '<div class="cards">';

  html += '<div class="card"><h3>地理位置</h3>';
  html += field('国家', d.country_name);
  html += field('国家代码', d.country_code);
  html += field('地区/省份', d.region_name);
  html += field('城市', d.city_name);
  html += field('邮编', d.zip_code);
  html += field('纬度', d.latitude);
  html += field('经度', d.longitude);
  html += field('时区', d.time_zone);
  html += '</div>';

  html += '<div class="card"><h3>网络信息</h3>';
  html += field('ASN', d.asn);
  html += field('AS 名称', d.as);
  html += '<div class="field"><span class="label">代理/VPN</span><span class="value">';
  if (d.is_proxy) {
    html += '<span class="badge badge-warn">是</span>';
  } else {
    html += '<span class="badge badge-safe">否</span>';
  }
  html += '</span></div>';
  html += '</div>';

  html += '</div>';

  result.innerHTML = html;
}
</script>
</body>
</html>`;
