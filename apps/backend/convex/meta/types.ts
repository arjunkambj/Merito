import type { Id } from "../_generated/dataModel";

export type FetchResponse = {
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

export type FormWithContext = {
  formId: string;
  formName: string;
  formLocale?: string;
  metaPageId: Id<"metaPages">;
  pageId: string;
  pageAccessToken: string;
};

export type LeadChange = {
  pageId: string;
  formId: string;
  leadId?: string;
};
