export const META_API_VERSION = "v24.0";
export const META_GRAPH_URL = `https://graph.facebook.com/${META_API_VERSION}`;

type FetchResponse = {
  ok: boolean;
  status: number;
  statusText: string;
  json(): Promise<unknown>;
  text(): Promise<string>;
};

export type MetaPage = {
  id: string;
  name: string;
  access_token: string;
  category?: string;
};

export type MetaForm = {
  id: string;
  name: string;
  locale?: string;
};

export type MetaLeadField = {
  name: string;
  values?: Array<string | number>;
};

export type MetaLead = {
  id: string;
  created_time: string;
  field_data: MetaLeadField[];
};

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
  console.log("[fetchMetaPages] Step 1: Requesting Meta pages");
  type ResponseShape = { data?: MetaPage[] };
  const response = (await fetch(
    `${META_GRAPH_URL}/me/accounts?access_token=${accessToken}&fields=id,name,access_token,category`
  )) as FetchResponse;
  console.log("[fetchMetaPages] Step 2: Processing Meta pages response");
  const json = await handleMetaResponse<ResponseShape>(response);
  console.log(
    `[fetchMetaPages] Step 3: Received ${json.data?.length ?? 0} pages`
  );
  return json.data ?? [];
};

export const fetchMetaForms = async (pageId: string, accessToken: string) => {
  console.log(`[fetchMetaForms] Step 1: Requesting forms for page ${pageId}`);
  type ResponseShape = { data?: MetaForm[] };
  const response = (await fetch(
    `${META_GRAPH_URL}/${pageId}/leadgen_forms?access_token=${accessToken}&fields=id,name,locale`
  )) as FetchResponse;
  console.log(
    `[fetchMetaForms] Step 2: Processing forms response for page ${pageId}`
  );
  const json = await handleMetaResponse<ResponseShape>(response);
  console.log(
    `[fetchMetaForms] Step 3: Received ${json.data?.length ?? 0} forms for page ${pageId}`
  );
  return json.data ?? [];
};

export const fetchFormLeads = async (
  formId: string,
  accessToken: string,
  since: number
) => {
  console.log(
    `[fetchFormLeads] Step 1: Starting lead fetch for form ${formId}`
  );
  const leads: MetaLead[] = [];
  let nextUrl: string | null =
    `${META_GRAPH_URL}/${formId}/leads?access_token=${accessToken}&fields=created_time,field_data&since=${since}`;
  let pageCount = 0;

  while (nextUrl) {
    pageCount++;
    console.log(
      `[fetchFormLeads] Step 2: Fetching page ${pageCount} of leads for form ${formId}`
    );
    const response = (await fetch(nextUrl)) as FetchResponse;
    const json = await handleMetaResponse<{
      data?: MetaLead[];
      paging?: { next?: string };
    }>(response);

    if (json.data?.length) {
      console.log(
        `[fetchFormLeads] Page ${pageCount}: Received ${json.data.length} leads`
      );
      leads.push(...json.data);
    }

    nextUrl = json.paging?.next ?? null;
  }

  console.log(
    `[fetchFormLeads] Step 3: Completed fetching ${leads.length} total leads for form ${formId}`
  );
  return leads;
};

export const fetchLeadDetails = async (leadId: string, accessToken: string) => {
  console.log(
    `[fetchLeadDetails] Step 1: Requesting details for lead ${leadId}`
  );
  const response = (await fetch(
    `${META_GRAPH_URL}/${leadId}?access_token=${accessToken}&fields=created_time,field_data,ad_id,form_id`
  )) as FetchResponse;
  console.log(
    `[fetchLeadDetails] Step 2: Processing lead details for ${leadId}`
  );
  return handleMetaResponse<MetaLead>(response);
};

export type NormalizedLead = {
  fullName?: string;
  email?: string;
  phone?: string;
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  customFields?: Record<string, unknown>;
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
  console.log(
    `[subscribePageToLeadgen] Step 1: Preparing webhook subscription for page ${pageId}`
  );
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

  console.log(
    `[subscribePageToLeadgen] Step 2: Sending subscription request for page ${pageId}`
  );
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

  console.log(
    `[subscribePageToLeadgen] Step 3: Successfully subscribed page ${pageId} to leadgen webhook`
  );
  return true;
};
