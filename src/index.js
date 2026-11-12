export default {
  async fetch(request, env) {
    const auth = request.headers.get("Authorization") || "";
    const expected = "Basic " + btoa("user:" + env.SITE_PASSWORD);

    if (auth !== expected) {
      return new Response("Login required", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Private site"' },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
