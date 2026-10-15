
function unauthorized() {
  return new Response("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Vibhillion Admin", charset="UTF-8"',
      "Cache-Control": "no-store"
    }
  });
}

export async function onRequest(context) {
  const path = new URL(context.request.url).pathname.replace(/\/+$/, "") || "/";

  if (
    path !== "/admin" &&
    path !== "/admin.html" &&
    !path.startsWith("/admin/")
  ) {
    return context.next();
  }

  const authorization = context.request.headers.get("Authorization");

  if (!authorization || !authorization.startsWith("Basic ")) {
    return unauthorized();
  }

  let credentials;

  try {
    credentials = atob(authorization.slice(6));
  } catch {
    return unauthorized();
  }

  const separator = credentials.indexOf(":");

  if (separator < 0) {
    return unauthorized();
  }

  const username = credentials.slice(0, separator);
  const password = credentials.slice(separator + 1);

  if (
    username !== "admin" ||
    !context.env.ADMIN_PASSWORD ||
    password !== context.env.ADMIN_PASSWORD
  ) {
    return unauthorized();
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
