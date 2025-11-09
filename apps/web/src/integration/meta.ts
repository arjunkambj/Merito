import { env } from "@/lib/env";

const META_API_VERSION = "v24.0";
const META_GRAPH_URL = `https://graph.facebook.com/${META_API_VERSION}`;

const redirectUri = `${env.NEXT_PUBLIC_APP_URL}/api/meta/`;

export const ConvertMetaCodeToAccessToken = async (code: string) => {
  const response = await fetch(`${META_GRAPH_URL}/oauth/access_token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: env.NEXT_PUBLIC_META_CLIENT_ID,
      client_secret: env.META_CLIENT_SECRET,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Meta access token: ${response.statusText}`
    );
  }

  const data = await response.json();
  console.log("[ConvertMetaCodeToAccessToken] Step 7: Access token data", data);
  return data;
};

export const SubscribeToMetaLeadChangeWebhook = async () => {
  return true;
};
