import { internalQuery, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

export const getPageByExternalId = internalQuery({
  args: { pageId: v.string() },
  handler: async (ctx, { pageId }) => {
    return ctx.db
      .query("metaPages")
      .withIndex("byPageId", (q) => q.eq("pageId", pageId))
      .first();
  },
});

export const getFormByExternalId = internalQuery({
  args: { formId: v.string() },
  handler: async (ctx, { formId }) => {
    return ctx.db
      .query("metaForms")
      .withIndex("byFormId", (q) => q.eq("formId", formId))
      .first();
  },
});

////////////////// Mutations //////////////////////

export const replaceMetaPages = internalMutation({
  args: {
    teamId: v.string(),
    pages: v.array(
      v.object({
        pageId: v.string(),
        pageName: v.string(),
        pageAccessToken: v.string(),
        pageAccessTokenExpiresAt: v.number(),
        connectedAppId: v.optional(v.string()),
        isWebhookSubscribed: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, { teamId, pages }) => {
    const existingPages = await ctx.db
      .query("metaPages")
      .withIndex("byTeamId", (q) => q.eq("teamId", teamId))
      .collect();

    const existingByPageId = new Map(
      existingPages.map((page) => [page.pageId, page])
    );
    const incomingIds = new Set(pages.map((page) => page.pageId));

    for (const page of existingPages) {
      if (!incomingIds.has(page.pageId)) {
        await ctx.db.delete(page._id);
      }
    }

    const results: Array<{ pageId: string; metaPageId: Id<"metaPages"> }> = [];

    for (const page of pages) {
      const previous = existingByPageId.get(page.pageId);
      if (previous) {
        await ctx.db.patch(previous._id, {
          pageName: page.pageName,
          pageAccessToken: page.pageAccessToken,
          pageAccessTokenExpiresAt: page.pageAccessTokenExpiresAt,
          isWebhookSubscribed:
            page.isWebhookSubscribed ?? previous.isWebhookSubscribed,
        });
        results.push({ pageId: page.pageId, metaPageId: previous._id });
        continue;
      }

      const metaPageId = await ctx.db.insert("metaPages", {
        teamId,
        pageId: page.pageId,
        pageName: page.pageName,
        pageAccessToken: page.pageAccessToken,
        pageAccessTokenExpiresAt: page.pageAccessTokenExpiresAt,
        isWebhookSubscribed: page.isWebhookSubscribed,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      results.push({ pageId: page.pageId, metaPageId });
    }

    return results;
  },
});

export const replaceMetaForms = internalMutation({
  args: {
    teamId: v.string(),
    forms: v.array(
      v.object({
        formId: v.string(),
        formName: v.string(),
        formLocale: v.optional(v.string()),
        metaPageId: v.id("metaPages"),
      })
    ),
  },
  handler: async (ctx, { teamId, forms }) => {
    const existingForms = await ctx.db
      .query("metaForms")
      .withIndex("byTeamId", (q) => q.eq("teamId", teamId))
      .collect();

    const existingByFormId = new Map(
      existingForms.map((form) => [form.formId, form])
    );
    const incomingIds = new Set(forms.map((form) => form.formId));

    for (const form of existingForms) {
      if (!incomingIds.has(form.formId)) {
        await ctx.db.delete(form._id);
      }
    }

    const now = Date.now();
    const results: Array<{ formId: string; metaFormId: Id<"metaForms"> }> = [];

    for (const form of forms) {
      const previous = existingByFormId.get(form.formId);
      if (previous) {
        await ctx.db.patch(previous._id, {
          formName: form.formName,
          metaPageId: form.metaPageId,
          updatedAt: now,
        });
        results.push({ formId: form.formId, metaFormId: previous._id });
        continue;
      }

      const metaFormId = await ctx.db.insert("metaForms", {
        teamId,
        metaPageId: form.metaPageId,
        formId: form.formId,
        formName: form.formName,
        createdAt: now,
        updatedAt: now,
      });
      results.push({ formId: form.formId, metaFormId });
    }

    return results;
  },
});

export const saveLeads = internalMutation({
  args: {
    leads: v.array(
      v.object({
        teamId: v.string(),
        metaFormId: v.id("metaForms"),
        metaLeadId: v.string(),
        fullName: v.optional(v.string()),
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        country: v.optional(v.string()),
        state: v.optional(v.string()),
        city: v.optional(v.string()),
        postalCode: v.optional(v.string()),
        customFields: v.optional(v.any()),
        capturedAt: v.number(),
      })
    ),
  },
  handler: async (ctx, { leads }) => {
    const now = Date.now();
    for (const lead of leads) {
      const existing = await ctx.db
        .query("leads")
        .withIndex("byMetaLeadId", (q) => q.eq("metaLeadId", lead.metaLeadId))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          fullName: lead.fullName ?? existing.fullName,
          email: lead.email ?? existing.email,
          phone: lead.phone ?? existing.phone,
          country: lead.country ?? existing.country,
          state: lead.state ?? existing.state,
          city: lead.city ?? existing.city,
          postalCode: lead.postalCode ?? existing.postalCode,
          customFields: lead.customFields ?? existing.customFields,
          capturedAt: lead.capturedAt,
          updatedAt: now,
        });
        continue;
      }

      await ctx.db.insert("leads", {
        teamId: lead.teamId,
        metaFormId: lead.metaFormId,
        metaLeadId: lead.metaLeadId,
        fullName: lead.fullName,
        email: lead.email,
        phone: lead.phone,
        country: lead.country,
        state: lead.state,
        city: lead.city,
        postalCode: lead.postalCode,
        customFields: lead.customFields,
        capturedAt: lead.capturedAt,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

export const saveWebhookEvent = internalMutation({
  args: {
    teamId: v.string(),
    pageId: v.string(),
    formId: v.string(),
    leadId: v.optional(v.string()),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("metaWebhookEvents", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const setPageWebhookStatus = internalMutation({
  args: {
    metaPageId: v.id("metaPages"),
    isWebhookSubscribed: v.boolean(),
  },
  handler: async (ctx, { metaPageId, isWebhookSubscribed }) => {
    await ctx.db.patch(metaPageId, { isWebhookSubscribed });
  },
});
