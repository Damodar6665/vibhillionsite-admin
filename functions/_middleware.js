const ADMIN_COOKIE = "vibhillion_admin_session";
const DAY_MS = 24 * 60 * 60 * 1000;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function encodeBase64Url(bytes) {
  let binary = "";
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
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
  const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));
  const signature = await crypto.subtle.sign("HMAC", key, payloadBytes);
  return `${encodeBase64Url(payloadBytes)}.${encodeBase64Url(new Uint8Array(signature))}`;
}

async function verifySession(secret, token) {
  if (!secret || !token || typeof token !== "string") {
    return false;
  }

  try {
    const parts = token.split(".");
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      return false;
    }

    const payloadBytes = decodeBase64Url(parts[0]);
    const signatureBytes = decodeBase64Url(parts[1]);
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
  const error = errorMessage ? `<p class="error" role="alert">${escapeHtml(errorMessage)}</p>` : "";

  return new Response(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex,nofollow" />
    <title>Admin Panel</title>
    <style>
      * { box-sizing: border-box; }
      html, body { min-height: 100%; margin: 0; }
      body {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px 16px;
        color: #f5f7fb;
        background: radial-gradient(ellipse at 50% 35%, #101a2b 0, #090d14 42%, #080808 78%);
        font-family: Inter, "Segoe UI", Arial, sans-serif;
      }
      .overlay {
        position: fixed;
        inset: 0;
        display: grid;
        place-items: center;
        padding: 24px 16px;
        background: rgba(0, 0, 0, .48);
        backdrop-filter: blur(5px);
      }
      .dialog {
        width: min(496px, 100%);
        padding: 28px 28px 20px;
        border: 1px solid rgba(255, 255, 255, .09);
        border-radius: 19px;
        background: #111214;
        box-shadow: 0 24px 70px rgba(0, 0, 0, .62);
      }
      .lock-badge {
        width: 62px;
        height: 62px;
        display: grid;
        place-items: center;
        margin: 0 auto 16px;
        border-radius: 12px;
        background: #2864e8;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, .18);
      }
      .lock-badge svg, .unlock svg {
        fill: none;
        stroke: currentColor;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .lock-badge svg { width: 31px; height: 31px; stroke: #fff; stroke-width: 2; }
      h1 {
        margin: 0;
        text-align: center;
        font-size: clamp(1.8rem, 5vw, 2.15rem);
        line-height: 1.2;
        letter-spacing: -.04em;
      }
      .subtitle {
        margin: 10px 0 27px;
        color: #aab3c0;
        text-align: center;
        font-size: 1rem;
      }
      label { display: block; margin-bottom: 8px; color: #e1e5eb; font-size: .92rem; }
      .password-wrap { position: relative; }
      input {
        width: 100%;
        height: 56px;
        padding: 0 52px 0 15px;
        border: 2px solid #4385ef;
        border-radius: 10px;
        outline: none;
        background: #eaf1fc;
        color: #101827;
        font: 600 1rem Inter, "Segoe UI", Arial, sans-serif;
      }
      input:focus { box-shadow: 0 0 0 3px rgba(64, 132, 239, .2); }
      .toggle {
        position: absolute;
        top: 50%;
        right: 10px;
        transform: translateY(-50%);
        width: 34px;
        height: 34px;
        border: 0;
        border-radius: 50%;
        background: transparent;
        color: #53657f;
        cursor: pointer;
        font-size: 1rem;
      }
      .toggle:hover { background: rgba(25, 63, 123, .1); }
      .error { margin: 9px 0 0; color: #ff9e9e; font-size: .88rem; }
      .unlock {
        width: 100%;
        min-height: 54px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 9px;
        margin-top: 18px;
        border: 0;
        border-radius: 10px;
        background: #1e48a8;
        color: #fff;
        cursor: pointer;
        font: 700 1rem Inter, "Segoe UI", Arial, sans-serif;
        transition: background .15s ease, transform .15s ease;
      }
      .unlock:hover { background: #2864e8; }
      .unlock:active { transform: translateY(1px); }
      .unlock svg { width: 20px; height: 20px; stroke-width: 2; }
      .protected {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-top: 20px;
        padding-top: 18px;
        border-top: 1px solid rgba(255, 255, 255, .08);
        color: #828c9b;
        font-size: .9rem;
      }
      .session {
        width: min(496px, 100%);
        margin: 14px auto 0;
        padding: 14px 12px;
        border: 1px solid rgba(63, 112, 194, .35);
        border-radius: 10px;
        background: rgba(17, 27, 43, .88);
        color: #9ebce9;
        text-align: center;
        font-size: .84rem;
      }
      @media (max-width: 480px) {
        .dialog { padding: 24px 20px 18px; }
      }
    </style>
  </head>
  <body>
    <main class="overlay">
      <div>
        <section class="dialog" role="dialog" aria-modal="true" aria-labelledby="login-title" aria-describedby="login-description">
          <div class="lock-badge" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M7 10V8a5 5 0 0 1 10 0v2" /><rect x="5" y="10" width="14" height="10" rx="2" /></svg>
          </div>
          <h1 id="login-title">Admin Panel</h1>
          <p class="subtitle" id="login-description">Enter your password to continue</p>
          <form method="POST" action="/admin.html" autocomplete="off">
            <label for="password">Password</label>
            <div class="password-wrap">
              <input id="password" name="admin_password" type="password" autocomplete="off" required autofocus />
              <button class="toggle" type="button" aria-label="Show password">◉</button>
            </div>
            ${error}
            <button class="unlock" type="submit">
              <svg viewBox="0 0 24 24"><path d="M7 10V8a5 5 0 0 1 10 0v2" /><rect x="5" y="10" width="14" height="10" rx="2" /></svg>
              Unlock Admin Panel
            </button>
          </form>
          <div class="protected"><span aria-hidden="true">🔒</span><span>This panel is password protected</span></div>
        </section>
        <div class="session">Your session will expire after 24 hours of inactivity</div>
      </div>
    </main>
    <script>
      const passwordInput = document.getElementById("password");
      const toggleButton = document.querySelector(".toggle");
      toggleButton.addEventListener("click", () => {
        const show = passwordInput.type === "password";
        passwordInput.type = show ? "text" : "password";
        toggleButton.setAttribute("aria-label", show ? "Hide password" : "Show password");
      });
    </script>
  </body>
</html>`, {
    status: 401,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

async function checkAuthorization(request, env) {
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

async function createSessionCookie(secret, requestUrl) {
  const expiresAt = Date.now() + DAY_MS;
  const sessionToken = await signSession(secret, { exp: expiresAt });
  const secure = new URL(requestUrl).protocol === "https:" ? "; Secure" : "";
  return `${ADMIN_COOKIE}=${encodeURIComponent(sessionToken)}; Path=/; Max-Age=86400; SameSite=Lax; HttpOnly${secure}`;
}

export async function onRequest(context) {
  const { request, env } = context;
  const path = new URL(request.url).pathname.replace(/\/+$/, "") || "/";

  if (path !== "/admin" && path !== "/admin.html" && !path.startsWith("/admin/")) {
    return context.next();
  }

  if (request.method === "POST") {
    const form = new URLSearchParams(await request.text());
    const password = form.get("admin_password") || "";

    if (!env.ADMIN_PASSWORD || password !== env.ADMIN_PASSWORD) {
      return buildLoginPage("Incorrect password. Please try again.");
    }

    const redirectUrl = path === "/admin" ? "/admin.html" : path;
    return new Response(null, {
      status: 302,
      headers: {
        Location: new URL(redirectUrl, request.url).toString(),
        "Set-Cookie": await createSessionCookie(env.ADMIN_PASSWORD, request.url),
        "Cache-Control": "no-store"
      }
    });
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
  if (env.ADMIN_PASSWORD) {
    headers.set("Set-Cookie", await createSessionCookie(env.ADMIN_PASSWORD, request.url));
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
