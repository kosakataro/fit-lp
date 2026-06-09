/**
 * Cloudflare Pages Middleware — HTTP Basic Auth
 *
 * env vars (Cloudflare Pages dashboard → Settings → Environment variables):
 *   BASIC_AUTH_USER  例: client
 *   BASIC_AUTH_PASS  例: a-long-strong-password
 *
 * 環境変数が未設定の場合は認証スキップ（パブリック）。
 * 本番では必ず両方セットすること。
 */

export async function onRequest(context) {
  const { request, env, next } = context;
  const user = env.BASIC_AUTH_USER;
  const pass = env.BASIC_AUTH_PASS;

  // 環境変数が未設定なら認証スキップ
  if (!user || !pass) return next();

  const auth = request.headers.get("Authorization");
  if (!auth || !auth.startsWith("Basic ")) {
    return new Response("Authentication required.", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="FIT preview", charset="UTF-8"' }
    });
  }

  const credentials = atob(auth.split(" ")[1]);
  const [u, p] = credentials.split(":");

  if (u !== user || p !== pass) {
    return new Response("Invalid credentials.", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="FIT preview", charset="UTF-8"' }
    });
  }

  return next();
}
