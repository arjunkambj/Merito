import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

export const saveMetaPage = internalMutation({
  args: {
    teamId: v.string(),
    page: v.object({
      id: v.string(),
      name: v.string(),
      access_token: v.string(),
      category: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const { teamId, page } = args;

    const metaPage = await ctx.db
      .query("metaPages")
      .withIndex("byTeamIdAndMetaPageId", (q) =>
        q.eq("teamId", teamId).eq("metaPageId", page.id)
      )
      .first();

    if (metaPage) {
      await ctx.db.patch(metaPage._id, {
        pageName: page.name,
        pageAccessToken: page.access_token,
        updatedAt: Date.now(),
      });

      return true;
    }

    const newMetaPage = await ctx.db.insert("metaPages", {
      teamId,
      metaPageId: page.id,
      pageName: page.name,
      pageAccessToken: page.access_token,
      isWebhookSubscribed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return true;
  },
});

export const saveMetaForm = internalMutation({
  args: {
    teamId: v.string(),
    metaPageId: v.string(),
    form: v.object({
      id: v.string(),
      name: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const { teamId, metaPageId, form } = args;

    const metaForm = await ctx.db
      .query("metaForms")
      .withIndex("byTeamIdAndMetaPageIdAndFormId", (q) =>
        q
          .eq("teamId", teamId)
          .eq("metaPageId", metaPageId)
          .eq("formId", form.id)
      )
      .first();

    if (metaForm) {
      await ctx.db.patch(metaForm._id, {
        formName: form.name,
        updatedAt: Date.now(),
      });
      return true;
    }

    await ctx.db.insert("metaForms", {
      teamId,
      metaPageId,
      formId: form.id,
      formName: form.name,
      isPrimary: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return true;
  },
});
