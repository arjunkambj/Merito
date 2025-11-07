import { env } from "@/lib/env";

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

///////////////////// Need to Review these functions /////////////////////

// Fetch pages associated with a business or user
export const FetchMetaPages = async (accessToken: string) => {
  const response = await fetch(
    `${META_GRAPH_URL}/me/accounts?fields=id,name,access_token,category,tasks&access_token=${accessToken}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch pages: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

// Fetch lead forms for a specific page
export const FetchMetaLeadForms = async (
  pageId: string,
  pageAccessToken: string
) => {
  const response = await fetch(
    `${META_GRAPH_URL}/${pageId}/leadgen_forms?fields=id,name,status,leads_count,created_time&access_token=${pageAccessToken}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch lead forms: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

// Fetch leads for a specific lead form
export const FetchMetaLeads = async (
  formId: string,
  pageAccessToken: string
) => {
  const response = await fetch(
    `${META_GRAPH_URL}/${formId}/leads?fields=id,created_time,field_data&access_token=${pageAccessToken}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch leads: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

// Subscribe page to webhooks for real-time lead updates
export const SubscribePageToWebhooks = async (
  pageId: string,
  pageAccessToken: string
) => {
  const response = await fetch(`${META_GRAPH_URL}/${pageId}/subscribed_apps`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      subscribed_fields: ["leadgen"],
      access_token: pageAccessToken,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to subscribe to webhooks: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

// Get a specific lead by ID
export const FetchMetaLeadById = async (
  leadId: string,
  pageAccessToken: string
) => {
  const response = await fetch(
    `${META_GRAPH_URL}/${leadId}?fields=id,created_time,field_data&access_token=${pageAccessToken}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch lead: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};
