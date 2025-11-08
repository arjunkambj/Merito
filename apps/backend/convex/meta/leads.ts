import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { fetchFormLeads, normalizeLeadFields } from "./utils";

export const pullLeadHistory = internalAction({
  args: {
    teamId: v.string(),
    formId: v.string(),
    metaFormId: v.id("metaForms"),
    pageId: v.string(),
    pageAccessToken: v.string(),
    since: v.number(),
  },
  handler: async (ctx, args) => {
    const leads = await fetchFormLeads(
      args.formId,
      args.pageAccessToken,
      args.since
    );

    if (!leads.length) {
      return { processed: 0 } as const;
    }

    const normalized = leads.map((lead) => {
      const parsed = normalizeLeadFields(lead.field_data ?? []);
      const capturedAt = Date.parse(lead.created_time ?? "");
      const customFields = parsed.customFields;

      return {
        teamId: args.teamId,
        metaFormId: args.metaFormId,
        metaLeadId: lead.id,
        fullName: parsed.fullName,
        email: parsed.email,
        phone: parsed.phone,
        country: parsed.country,
        state: parsed.state,
        city: parsed.city,
        postalCode: parsed.postalCode,
        customFields:
          customFields && Object.keys(customFields).length
            ? customFields
            : undefined,
        capturedAt: Number.isFinite(capturedAt) ? capturedAt : Date.now(),
      };
    });

    await ctx.runMutation(internal.meta.mutation.saveLeads, {
      leads: normalized,
    });

    return { processed: normalized.length };
  },
});
