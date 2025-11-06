import { env } from "@/lib/env";

export class MetaClient {
  metaApiVersion = "v24.0";
  metaApiUrl = `https://graph.facebook.com/${this.metaApiVersion}`;

  createOAuthUrl(state: string) {
    const url = new URL(`www.facebook.com/${this.metaApiVersion}/dialog/oauth`);
    url.searchParams.set("client_id", env.NEXT_PUBLIC_STACK_PROJECT_ID);
    url.searchParams.set(
      "redirect_uri",
      `${process.env.NEXT_PUBLIC_APP_URL}/api/meta/`
    );
    url.searchParams.set("response_type", "code");
    url.searchParams.set("state", state);
    url.searchParams.set(
      "scope",
      "leads.read_user_data,leads.read_user_targeting_criteria"
    );
    return url.toString();
  }

  async getAccessToken(code: string) {
    const response = await fetch(`${this.metaApiUrl}/oauth/access_token?`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: env.NEXT_PUBLIC_META_CLIENT_ID,
        client_secret: env.META_CLIENT_SECRET,
        grant_type: "authorization_code",
        access_type: "offline",
        scope:
          "pages_show_list leads_retrieval business_management pages_manage_metadata",
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/meta/`,
      }).toString(),
    });
    const data = await response.json();
    return data.access_token;
  }

  async getUserPages(accessToken: string) {
    const response = await fetch(`${this.metaApiUrl}/me/accounts`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();
    return data.data;
  }

  async subscribeToLeadsWebhook(accessToken: string, pageId: string[]) {
    const response = await fetch(`${this.metaApiUrl}/${pageId}/subscriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.json();
  }
}
