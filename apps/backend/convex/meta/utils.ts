export const META_API_VERSION = "v24.0";
export const META_GRAPH_URL = `https://graph.facebook.com/${META_API_VERSION}`;

const LEAD_FIELDS = [
  "id",
  "created_time",
  "field_data",
  "form_id",
  "page_id",
  "is_organic",
  "ad_id",
  "ad_name",
  "adset_id",
  "adset_name",
  "adgroup_id",
  "adgroup_name",
  "campaign_id",
  "campaign_name",
];

export const fetchMetaPages = async (accessToken: string) => {
  const pages = await fetch(
    `${META_GRAPH_URL}/me/accounts?access_token=${accessToken}&fields=id,name,access_token,category`
  );

  return pages.json();
};

export const fetchMetaForms = async (pageId: string, accessToken: string) => {
  const forms = await fetch(
    `${META_GRAPH_URL}/${pageId}/leadgen_forms?access_token=${accessToken}&fields=id,name,locale`
  );

  return forms.json();
};

export const fetchMetaLeads = async (formId: string, accessToken: string) => {
  const url = new URL(`${META_GRAPH_URL}/${formId}/leads`);
  url.searchParams.append("access_token", accessToken);

  const leads = await fetch(url.toString());
  return leads.json();
};
