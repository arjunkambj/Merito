import { env } from "@/lib/env";
import { cookies } from "next/headers";
const META_API_VERSION = "v24.0";
const META_GRAPH_URL = `https://graph.facebook.com/${META_API_VERSION}`;

const redirectUri = `${env.NEXT_PUBLIC_APP_URL}/api/meta/`;

export const FetchMetaAccessToken = async (code: string) => {
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
  return data;
};

export const FetchMetaRefreshToken = async (shortLivedToken: string) => {
  const response = await fetch(
    `${META_GRAPH_URL}/oauth/access_token?${new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: env.NEXT_PUBLIC_META_CLIENT_ID,
      client_secret: env.META_CLIENT_SECRET,
      fb_exchange_token: shortLivedToken,
    }).toString()}`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to exchange Meta access token: ${response.statusText}`
    );
  }

  const data = await response.json();
  return data;
};

export const VerifyMetaState = async (state: string) => {
  const cookieStore = await cookies();
  const cookieState = cookieStore.get("meta:state");
  if (!cookieState) {
    return false;
  }
  if (cookieState.value !== state) {
    return false;
  }
  return true;
};
