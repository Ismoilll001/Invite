import handler from "vinext/server/fetch-handler";

// The standalone Worker has no trusted ChatGPT identity proxy.
// Never accept user-supplied identity headers as a customer or moderator login.
export default {
  fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext) {
    const cleanHeaders = new Headers(request.headers);
    for (const key of [...cleanHeaders.keys()]) {
      if (key.toLowerCase().startsWith("oai-authenticated-user-")) {
        cleanHeaders.delete(key);
      }
    }
    return handler.fetch(new Request(request, { headers: cleanHeaders }), env, ctx);
  },
};
