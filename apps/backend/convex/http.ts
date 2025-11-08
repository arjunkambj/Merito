import { httpRouter } from "convex/server";
import { metaWebhookGet, metaWebhookPost } from "./meta";

const http = httpRouter();

http.route({
  path: "/meta/webhook",
  method: "GET",
  handler: metaWebhookGet,
});

http.route({
  path: "/meta/webhook",
  method: "POST",
  handler: metaWebhookPost,
});
export default http;
