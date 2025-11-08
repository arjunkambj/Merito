import { v } from "convex/values";
import { action } from "../_generated/server";
import { httpAction } from "../_generated/server";
import { fetchMetaPages, fetchMetaForms } from "./utils";
import { internal } from "../_generated/api";
import { z } from "zod";

const MetaPageSchema = z.object({
  id: z.string(),
  name: z.string(),
  access_token: z.string(),
  category: z.string(),
});

const MetaFormSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const handleMetaCallback = action({
  args: {
    teamId: v.string(),
    accessToken: v.string(),
    integratedByUserId: v.string(),
  },

  handler: async (ctx, args) => {
    const { teamId, accessToken, integratedByUserId } = args;
    await ctx.runMutation(internal.core.integration.saveIntegration, {
      teamId,
      accessToken,
      integratedByUserId,
      accessTokenExpiresAt: Date.now() + 1000 * 60 * 60 * 24 * 55,
      integrationType: "meta",
    });

    const PagesResponse = await fetchMetaPages(accessToken);
    const metaPages = z.array(MetaPageSchema).parse(PagesResponse.data);

    for (const metaPage of metaPages) {
      await ctx.runMutation(internal.meta.internal.saveMetaPage, {
        teamId,
        page: metaPage,
      });
    }

    for (const metaPage of metaPages) {
      const FormsResponse = await fetchMetaForms(
        metaPage.id,
        metaPage.access_token
      );

      if (FormsResponse.data.length > 0) {
        const metaForms = z.array(MetaFormSchema).parse(FormsResponse.data);
        for (const metaForm of metaForms) {
          await ctx.runMutation(internal.meta.internal.saveMetaForm, {
            teamId,
            metaPageId: metaPage.id,
            form: {
              id: metaForm.id,
              name: metaForm.name,
            },
          });
        }
      }
    }

    await ctx.runMutation(
      internal.core.integration.updatesecuessfullyIntegrated,
      {
        teamId,
        integrationType: "meta",
      }
    );
  },
});

export const handleMetaWebhook = httpAction(async (ctx, request) => {
  return new Response("OK", { status: 200 });
});
