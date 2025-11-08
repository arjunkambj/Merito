import { internalQuery, query } from "../_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";

export const listFormsWithPages = query({
  args: { teamId: v.string() },
  handler: async (ctx, { teamId }) => {
    const forms = await ctx.db
      .query("metaForms")
      .withIndex("byTeamId", (q) => q.eq("teamId", teamId))
      .collect();

    if (forms.length === 0) {
      return [];
    }

    const pageIds = Array.from(
      new Set<Id<"metaPages">>(forms.map((form) => form.metaPageId))
    );

    const pagesById = new Map<Id<"metaPages">, Doc<"metaPages">>();
    for (const pageId of pageIds) {
      const page = await ctx.db.get(pageId);
      if (page) {
        pagesById.set(pageId, page);
      }
    }

    return forms.map((form) => {
      const page = pagesById.get(form.metaPageId);
      return {
        id: form._id,
        formId: form.formId,
        formName: form.formName,
        isPrimary: !!form.isPrimary,
        page: page
          ? {
              id: page._id,
              pageId: page.pageId,
              pageName: page.pageName,
            }
          : undefined,
      };
    });
  },
});

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
