import { httpAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { fetchLeadDetails, normalizeLeadFields } from "./utils";

type LeadChange = {
  pageId: string;
  formId: string;
  leadId?: string;
};

const webhookVerifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;

const extractLeadChanges = (payload: any): LeadChange[] => {
  if (!payload?.entry) return [];
  const results: LeadChange[] = [];

  for (const entry of payload.entry) {
    const pageId = entry.id ?? entry.uid ?? entry.page_id;
    const changes = entry.changes ?? [];
    for (const change of changes) {
      if (change.field !== "leadgen") continue;
      const value = change.value ?? {};
      results.push({
        pageId: `${value.page_id ?? pageId ?? ""}`,
        formId: `${value.form_id ?? value.leadgen_form_id ?? ""}`,
        leadId: value.leadgen_id ?? value.lead_id ?? value.id,
      });
    }
  }

  return results.filter((change) => change.pageId && change.formId && change.leadId);
};

export const metaWebhookGet = httpAction(async (_ctx, request) => {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge") ?? "";

  if (mode === "subscribe") {
    if (!webhookVerifyToken || token === webhookVerifyToken) {
      return new Response(challenge, { status: 200 });
    }
    return new Response("Invalid verify token", { status: 403 });
  }

  return new Response("Unsupported mode", { status: 400 });
});

export const metaWebhookPost = httpAction(async (ctx, request) => {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    console.error("Invalid webhook payload", error);
    return new Response("Invalid payload", { status: 400 });
  }

  const leadChanges = extractLeadChanges(payload);

  for (const change of leadChanges) {
    const pageDoc = await ctx.runQuery(
      internal.meta.query.getPageByExternalId,
      { pageId: change.pageId }
    );

    const formDoc = await ctx.runQuery(
      internal.meta.query.getFormByExternalId,
      { formId: change.formId }
    );

    await ctx.runMutation(internal.meta.mutation.saveWebhookEvent, {
      teamId: pageDoc?.teamId ?? "unknown",
      pageId: change.pageId,
      formId: change.formId,
      leadId: change.leadId,
      payload: change,
    });

    if (!pageDoc || !formDoc) {
      continue;
    }

    let leadDetails = null;
    if (change.leadId) {
      try {
        leadDetails = await fetchLeadDetails(change.leadId, pageDoc.pageAccessToken);
      } catch (error) {
        console.error("Failed to fetch lead from webhook", error);
      }
    }

    if (!leadDetails) {
      continue;
    }

    const parsed = normalizeLeadFields(leadDetails.field_data ?? []);
    const capturedAt = Date.parse(leadDetails.created_time ?? "");

    await ctx.runMutation(internal.meta.mutation.saveLeads, {
      leads: [
        {
          teamId: pageDoc.teamId,
          metaFormId: formDoc._id,
          metaLeadId: leadDetails.id,
          fullName: parsed.fullName,
          email: parsed.email,
          phone: parsed.phone,
          country: parsed.country,
          state: parsed.state,
          city: parsed.city,
          postalCode: parsed.postalCode,
          customFields:
            parsed.customFields &&
            Object.keys(parsed.customFields).length > 0
              ? parsed.customFields
              : undefined,
          capturedAt: Number.isFinite(capturedAt) ? capturedAt : Date.now(),
        },
      ],
    });
  }

  return new Response("OK", { status: 200 });
});
