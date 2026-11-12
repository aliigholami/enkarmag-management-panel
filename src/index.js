import { Buffer } from "node:buffer";
// Secure comparison to prevent timing attacks
const encoder = new TextEncoder();
function timingSafeEqual(a, b) {
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  if (aBytes.byteLength !== bBytes.byteLength) {
    return !crypto.subtle.timingSafeEqual(aBytes, aBytes);
  }
  return crypto.subtle.timingSafeEqual(aBytes, bBytes);
}

export default {
  async fetch(request, env) {
    const BASIC_USER = "admin"; // Username, you can change it
    const BASIC_PASS = env.PASSWORD; // This reads the Secret you added in the dashboard
    console.log("The Password from env:", BASIC_PASS ? "EXISTS" : "MISSING");
    const authorization = request.headers.get("Authorization");
    if (!authorization) {
      return new Response("You need to login.", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="my scope", charset="UTF-8"' },
      });
    }

    const [scheme, encoded] = authorization.split(" ");
    if (!encoded || scheme !== "Basic") {
      return new Response("Malformed authorization header.", { status: 400 });
    }

    const credentials = Buffer.from(encoded, "base64").toString();
    const index = credentials.indexOf(":");
    const user = credentials.substring(0, index);
    const pass = credentials.substring(index + 1);

    if (!timingSafeEqual(BASIC_USER, user) || !timingSafeEqual(BASIC_PASS, pass)) {
      return new Response("You need to login.", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="my scope", charset="UTF-8"' },
      });
    }

    // Authentication passed, return your actual webpage content
    // If you previously had HTML string here, keep it; if you need to read static files, use env.ASSETS.fetch(request)
    return env.ASSETS.fetch(request);
    //return new Response("🎉 You have private access!", {
    //  headers: { "Content-Type": "text/html;charset=UTF-8", "Cache-Control": "no-store" },
    //});
  }
}
