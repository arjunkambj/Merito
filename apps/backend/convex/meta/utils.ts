export const META_API_VERSION = "v24.0";
export const META_GRAPH_URL = `https://graph.facebook.com/${META_API_VERSION}`;
import type {
  FetchResponse,
  MetaPage,
  MetaForm,
  MetaLead,
  MetaLeadField,
  NormalizedLead,
} from "./types";

const handleMetaResponse = async <T>(response: FetchResponse) => {
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Meta request failed: ${response.status} ${response.statusText} - ${errorBody}`
    );
  }
  return (await response.json()) as T;
};

export const fetchMetaPages = async (accessToken: string) => {
  type ResponseShape = { data?: MetaPage[] };
  const response = (await fetch(
    `${META_GRAPH_URL}/me/accounts?access_token=${accessToken}&fields=id,name,access_token,category`
  )) as FetchResponse;
  const json = await handleMetaResponse<ResponseShape>(response);
  return json.data ?? [];
};

export const fetchMetaForms = async (pageId: string, accessToken: string) => {
  type ResponseShape = { data?: MetaForm[] };
  const response = (await fetch(
    `${META_GRAPH_URL}/${pageId}/leadgen_forms?access_token=${accessToken}&fields=id,name,locale`
  )) as FetchResponse;
  const json = await handleMetaResponse<ResponseShape>(response);
  return json.data ?? [];
};

export const fetchFormLeads = async (
  formId: string,
  accessToken: string,
  since: number
) => {
  const leads: MetaLead[] = [];
  let nextUrl: string | null =
    `${META_GRAPH_URL}/${formId}/leads?access_token=${accessToken}&fields=created_time,field_data&since=${since}`;
  let pageCount = 0;

  while (nextUrl) {
    pageCount++;
    const response = (await fetch(nextUrl)) as FetchResponse;
    const json = await handleMetaResponse<{
      data?: MetaLead[];
      paging?: { next?: string };
    }>(response);

    if (json.data?.length) {
      leads.push(...json.data);
    }

    nextUrl = json.paging?.next ?? null;
  }

  return leads;
};

export const fetchLeadDetails = async (leadId: string, accessToken: string) => {
  const response = (await fetch(
    `${META_GRAPH_URL}/${leadId}?access_token=${accessToken}&fields=created_time,field_data,ad_id,form_id`
  )) as FetchResponse;
  return handleMetaResponse<MetaLead>(response);
};

export const normalizeLeadFields = (fieldData: MetaLeadField[]) => {
  const normalized: NormalizedLead = {
    customFields: {},
  };

  for (const field of fieldData) {
    const value = field.values?.length ? `${field.values[0] ?? ""}` : undefined;
    switch (field.name) {
      case "full_name":
      case "name":
        normalized.fullName = value;
        break;
      case "email":
        normalized.email = value;
        break;
      case "phone_number":
      case "phone":
        normalized.phone = value;
        break;
      case "country":
        normalized.country = value;
        break;
      case "state":
      case "state_province":
        normalized.state = value;
        break;
      case "city":
        normalized.city = value;
        break;
      case "zip":
      case "zip_code":
      case "postal_code":
        normalized.postalCode = value;
        break;
      default: {
        if (!normalized.customFields) {
          normalized.customFields = {};
        }
        normalized.customFields[field.name] =
          field.values?.length === 1 ? value : field.values;
        break;
      }
    }
  }

  return normalized;
};

export const subscribePageToLeadgen = async (
  pageId: string,
  accessToken: string,
  callbackUrl?: string,
  verifyToken?: string
) => {
  const params = new URLSearchParams({
    subscribed_fields: "leadgen",
    access_token: accessToken,
  });

  if (callbackUrl) {
    params.set("callback_url", callbackUrl);
  }
  if (verifyToken) {
    params.set("verify_token", verifyToken);
  }

  const response = (await fetch(`${META_GRAPH_URL}/${pageId}/subscribed_apps`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  })) as FetchResponse;

  if (!response.ok) {
    console.error(
      `[subscribePageToLeadgen] Error: Failed to subscribe page ${pageId}`,
      await response.text()
    );
    return false;
  }

  return true;
};
