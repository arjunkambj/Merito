import { v } from "convex/values";
import { action, internalAction } from "../_generated/server";
import { httpAction } from "../_generated/server";
import { fetchMetaPages, fetchMetaForms, fetchMetaLeads } from "./utils";
import { internal } from "../_generated/api";
import { components } from "../_generated/api";
import { z } from "zod";
import { Workpool } from "@convex-dev/workpool";

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

const metaWorkpool = new Workpool(components.MetaLeadsWorkpool, {
  maxParallelism: 5,
  retryActionsByDefault: true,
  defaultRetryBehavior: {
    maxAttempts: 3,
    initialBackoffMs: 1000,
    base: 2,
  },
});

export const handleMetaCallback = action({
  args: {
    teamId: v.string(),
    accessToken: v.string(),
    integratedByUserId: v.string(),
  },

  handler: async (ctx, args) => {
    const { teamId, accessToken, integratedByUserId } = args;
    await ctx.runMutation(internal.core.onboarding.saveIntegration, {
      teamId,
      accessToken,
      integratedByUserId,
      accessTokenExpiresAt: Date.now() + 1000 * 60 * 60 * 24 * 55,
      integrationType: "meta",
    });

    const PagesResponse = await fetchMetaPages(accessToken);
    const metaPages = z.array(MetaPageSchema).parse(PagesResponse.data);

    // fetching form of all page and saving in parallel
    await Promise.all(
      metaPages.map((metaPage) =>
        metaWorkpool.enqueueAction(
          ctx,
          internal.meta.action.processPageForms,
          {
            teamId,
            metaPage,
          },
          {
            retry: true,
          }
        )
      )
    );

    await ctx.runMutation(
      internal.core.onboarding.updateSuccessfullyIntegrated,
      {
        teamId,
        integrationType: "meta",
      }
    );
  },
});

export const processPageForms = internalAction({
  args: {
    teamId: v.string(),
    metaPage: v.object({
      id: v.string(),
      name: v.string(),
      access_token: v.string(),
      category: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const { teamId, metaPage } = args;

    const FormsResponse = await fetchMetaForms(
      metaPage.id,
      metaPage.access_token
    );

    if (FormsResponse.data.length > 0) {
      const metaForms = z.array(MetaFormSchema).parse(FormsResponse.data);

      await Promise.all(
        metaForms.map((metaForm) =>
          metaWorkpool.enqueueMutation(
            ctx,
            internal.meta.internal.saveMetaForm,
            {
              teamId,
              metaPageId: metaPage.id,
              pageName: metaPage.name,
              pageAccessToken: metaPage.access_token,
              form: {
                id: metaForm.id,
                name: metaForm.name,
              },
            }
          )
        )
      );
    }
  },
});

export const fetchInitialLeads = action({
  args: {
    teamId: v.string(),
  },
  handler: async (ctx, args) => {
    const { teamId } = args;

    const primaryMetaForms = await ctx.runQuery(
      internal.meta.internal.getPrimaryMetaForms,
      {
        teamId,
      }
    );

    await Promise.all(
      primaryMetaForms.map((metaForm) =>
        metaWorkpool.enqueueAction(
          ctx,
          internal.meta.action.processFormLeads,
          {
            teamId,
            metaFormId: metaForm._id,
            formId: metaForm.formId,
            pageAccessToken: metaForm.pageAccessToken,
          },
          {
            retry: true,
          }
        )
      )
    );

    await ctx.runMutation(internal.core.onboarding.updateLeadsSynced, {
      teamId,
    });
  },
});

export const processFormLeads = internalAction({
  args: {
    teamId: v.string(),
    metaFormId: v.id("metaForms"),
    formId: v.string(),
    pageAccessToken: v.string(),
  },
  handler: async (ctx, args) => {
    const { teamId, metaFormId, formId, pageAccessToken } = args;

    const leadsResponse = await fetchMetaLeads(formId, pageAccessToken);
    console.log(leadsResponse);
  },
});

export const handleMetaWebhook = httpAction(async (ctx, request) => {
  return new Response("OK", { status: 200 });
});
