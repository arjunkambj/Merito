import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

export const saveMetaForm = internalMutation({
  args: {
    teamId: v.string(),
    metaPageId: v.string(),
    pageName: v.string(),
    pageAccessToken: v.string(),
    form: v.object({
      id: v.string(),
      name: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const { teamId, metaPageId, form, pageName, pageAccessToken } = args;

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
        pageName,
        pageAccessToken,
        updatedAt: Date.now(),
      });

      return true;
    }

    await ctx.db.insert("metaForms", {
      teamId,
      metaPageId,
      pageName,
      pageAccessToken,
      formId: form.id,
      formName: form.name,
      isPrimary: false,
      isWebhookSubscribed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return true;
  },
});
