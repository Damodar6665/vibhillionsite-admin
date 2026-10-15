
const ADMIN_COOKIE = "vibhillion_admin_session";
const DAY_MS = 24 * 60 * 60 * 1000;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>\"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '\"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function encodeBase64Url(bytes) {
  let binary = "";
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function decodeBase64Url(value) {
  const base = String(value).replace(/-/g, "+").replace(/_/g, "/");
  const padded = base + "=".repeat((4 - (base.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function signSession(secret, payload) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(JSON.stringify(payload)));
  return `${encodeBase64Url(new TextEncoder().encode(JSON.stringify(payload)))}.${encodeBase64Url(new Uint8Array(signature))}`;
}

async function verifySession(secret, token) {
  if (!secret || !token || typeof token !== "string") {
    return false;
  }

  try {
    const [payloadPart, signaturePart] = token.split(".");
    if (!payloadPart || !signaturePart) {
      return false;
    }

    const payloadBytes = decodeBase64Url(payloadPart);
    const signatureBytes = decodeBase64Url(signaturePart);
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const valid = await crypto.subtle.verify("HMAC", key, signatureBytes, payloadBytes);
    if (!valid) {
      return false;
    }

    const payload = JSON.parse(new TextDecoder().decode(payloadBytes));
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

function buildLoginPage(errorMessage = "") {
  const error = errorMessage ? `<div class="form-error">${escapeHtml(errorMessage)}</div>` : "";

  return new Response(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex,nofollow" />
    <title>Admin Panel</title>
    <style>
      :root {
        --bg: #04070a;
        --panel: rgba(17, 21, 28, 0.96);
        --panel-strong: rgba(12, 16, 22, 0.98);
        --border: rgba(255, 255, 255, 0.08);
        --text: #f3f6fb;
        --muted: #b7c0cc;
        --soft: #d7e3f1;
        --blue: #0d6efd;
        --blue-dark: #0b4fc7;
        --blue-light: #1f8bff;
        --field: #edf2f8;
        --field-border: #4f8fe9;
        --notice: rgba(18, 36, 64, 0.96);
        --danger: #ed6b6b;
        --warning: #f5c15f;
      }

      * { box-sizing: border-box; }

      html, body {
        margin: 0;
        min-height: 100%;
        height: 100%;
        font-family: Inter, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        background:
          radial-gradient(circle at top, rgba(17, 73, 182, 0.18), transparent 30%),
          #04070a;
        color: var(--text);
      }

      body {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 32px 18px;
      }

      .shell {
        width: min(520px, 100%);
      }

      .card {
        background: linear-gradient(180deg, rgba(16, 19, 24, 0.96), rgba(15, 18, 23, 0.96));
        border: 1px solid var(--border);
        border-radius: 22px;
        padding: 32px 28px 20px;
        box-shadow: 0 30px 60px rgba(0, 0, 0, 0.45);
      }

      .lock-badge {
        width: 72px;
        height: 72px;
        margin: 0 auto 18px;
        border-radius: 18px;
        display: grid;
        place-items: center;
        background: linear-gradient(180deg, var(--blue-light), var(--blue));
        border: 1px solid rgba(255, 255, 255, 0.16);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.22);
      }

      .lock-badge svg {
        width: 34px;
        height: 34px;
        stroke: #f4f9ff;
        fill: none;
        stroke-width: 2.6;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      h1 {
        margin: 0;
        text-align: center;
        font-size: clamp(2.2rem, 4vw, 3.2rem);
        line-height: 1.1;
        letter-spacing: -0.06em;
        font-weight: 800;
      }

      .subtitle {
        margin: 18px 0 22px;
        text-align: center;
        font-size: 1.05rem;
        font-weight: 500;
        color: rgba(232, 238, 246, 0.78);
      }

      form {
        display: grid;
        gap: 12px;
      }

      .label {
        font-size: 0.98rem;
        color: rgba(244, 247, 251, 0.82);
        margin-bottom: 6px;
        display: block;
      }

      .password-wrap {
        position: relative;
        display: flex;
        align-items: center;
      }

      input[type="password"], input[type="text"] {
        width: 100%;
        height: 62px;
        border-radius: 12px;
        border: 2px solid var(--field-border);
        background: rgba(237, 242, 248, 0.98);
        color: #0f172a;
        font-size: 1.05rem;
        font-weight: 600;
        padding: 0 52px 0 16px;
        outline: none;
        box-shadow: inset 0 0 0 1px rgba(12, 55, 116, 0.12);
      }

      input[type="password"]:focus, input[type="text"]:focus {
        border-color: var(--blue-light);
        box-shadow: 0 0 0 3px rgba(49, 127, 237, 0.15);
      }

      .pass-toggle {
        position: absolute;
        right: 12px;
        width: 26px;
        height: 26px;
        border: none;
        background: rgba(220, 86, 86, 0.12);
        border-radius: 50%;
        display: grid;
        place-items: center;
        cursor: pointer;
        padding: 0;
      }

      .pass-toggle::before {
        content: "";
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #c85c5c;
        box-shadow: 0 0 0 2px rgba(255,255,255,0.2);
      }

      .form-error {
        min-height: 22px;
        color: #ffb5b5;
        font-size: 0.92rem;
        margin-top: 2px;
      }

      .unlock-btn {
        border: none;
        border-radius: 12px;
        height: 64px;
        margin-top: 10px;
        background: linear-gradient(180deg, var(--blue-light), var(--blue));
        color: #fdfefe;
        font-size: 1.1rem;
        font-weight: 700;
        letter-spacing: -0.02em;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        cursor: pointer;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.2), 0 10px 24px rgba(17, 99, 228, 0.22);
      }

      .unlock-btn svg {
        width: 22px;
        height: 22px;
        stroke: currentColor;
        fill: none;
        stroke-width: 2.2;
      }

      .protected-note {
        margin-top: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: rgba(232, 238, 246, 0.70);
        font-size: 1rem;
      }

      .protected-note .info-dot {
        display: inline-grid;
        place-items: center;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        font-size: 0.7rem;
        background: rgba(255, 193, 95, 0.2);
        color: #f8d27a;
      }

      .session-banner {
        margin-top: 18px;
        background: rgba(18, 31, 48, 0.9);
        border: 1px solid rgba(80, 128, 206, 0.42);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        min-height: 56px;
        padding: 12px 16px;
        color: rgba(233, 240, 248, 0.82);
        font-size: 0.98rem;
      }

      .session-banner .info-mark {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: rgba(77, 123, 196, 0.2);
        color: #dfe9fc;
        display: inline-grid;
        place-items: center;
        font-size: 0.76rem;
        font-weight: 700;
      }

      @media (max-width: 560px) {
        .card {
          padding: 28px 20px 18px;
          border-radius: 16px;
        }

        .subtitle {
          font-size: 0.96rem;
        }

        .session-banner {
          font-size: 0.92rem;
        }
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <section class="card" aria-label="Admin login panel">
        <div class="lock-badge" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M7 10V8a5 5 0 0 1 10 0v2" />
            <rect x="5" y="10" width="14" height="10" rx="2" />
            <path d="M12 14v3" />
          </svg>
        </div>

        <h1>Admin Panel</h1>
        <p class="subtitle">Enter your password to continue</p>

        <form method="POST" action="${escapeHtml("/admin.html")}">
          <div>
            <label class="label" for="password">Password</label>
            <div class="password-wrap">
              <input id="password" name="password" type="password" autocomplete="current-password" />
              <button type="button" class="pass-toggle" aria-label="Show password"></button>
            </div>
          </div>
          ${error}
          <button class="unlock-btn" type="submit">
            <svg viewBox="0 0 24 24">
              <path d="M7 10V8a5 5 0 0 1 10 0v2" />
              <rect x="5" y="10" width="14" height="10" rx="2" />
              <path d="M12 14v3" />
            </svg>
            Unlock Admin Panel
          </button>
        </form>

        <div class="protected-note">
          <span class="info-dot">🔒</span>
          <span>This panel is password protected</span>
        </div>
      </section>

      <div class="session-banner">
        <span class="info-mark">i</span>
        <span>Your session will expire after 24 hours of inactivity</span>
      </div>
    </main>

    <script>
      const passwordInput = document.getElementById('password');
      const toggleButton = document.querySelector('.pass-toggle');
      if (passwordInput && toggleButton) {
        toggleButton.addEventListener('click', () => {
          const showPassword = passwordInput.type === 'password';
          passwordInput.type = showPassword ? 'text' : 'password';
        });
      }
    </script>
  </body>
</html>` , {
    status: 401,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

async function checkAuthorization(request, env) {
  const authorization = request.headers.get("Authorization");
  if (authorization && authorization.startsWith("Basic ")) {
    let credentials;
    try {
      credentials = atob(authorization.slice(6));
    } catch {
      return false;
    }

    const separator = credentials.indexOf(":");
    if (separator < 0) {
      return false;
    }

    const username = credentials.slice(0, separator);
    const password = credentials.slice(separator + 1);
    return username === "admin" && Boolean(env.ADMIN_PASSWORD) && password === env.ADMIN_PASSWORD;
  }

  const cookieHeader = request.headers.get("Cookie") || "";
  const match = cookieHeader.match(/(?:^|;\s*)vibhillion_admin_session=([^;]+)/);
  if (!match) {
    return false;
  }

  try {
    return await verifySession(env.ADMIN_PASSWORD, decodeURIComponent(match[1]));
  } catch {
    return false;
  }
}

export async function onRequest(context) {
  const request = context.request;
  const path = new URL(request.url).pathname.replace(/\/+$/, "") || "/";

  if (
    path !== "/admin" &&
    path !== "/admin.html" &&
    !path.startsWith("/admin/")
  ) {
    return context.next();
  }

  const { env } = context;

  if (request.method === "POST") {
    const body = await request.text();
    const form = new URLSearchParams(body);
    const password = form.get("password") || "";

    if (password === env.ADMIN_PASSWORD) {
      const expiresAt = Date.now() + DAY_MS;
      const sessionToken = await signSession(env.ADMIN_PASSWORD, { exp: expiresAt });
      const redirectUrl = path === "/admin" ? "/admin.html" : path;
      return new Response(null, {
        status: 302,
        headers: {
          Location: new URL(redirectUrl, request.url).toString(),
          "Set-Cookie": `${ADMIN_COOKIE}=${encodeURIComponent(sessionToken)}; Path=/; Max-Age=86400; SameSite=Lax; HttpOnly`
        }
      });
    }

    return buildLoginPage("Incorrect password. Please try again.");
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method not allowed", {
      status: 405,
      headers: { "Cache-Control": "no-store" }
    });
  }

  if (!(await checkAuthorization(request, env))) {
    return buildLoginPage();
  }

  const response = await context.next();
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "no-store");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
