import { v } from "convex/values";
import { action, internalAction } from "../_generated/server";
import { httpAction } from "../_generated/server";
import {
  fetchMetaPages,
  fetchMetaForms,
  fetchMetaLeads,
  fetchFromUrl,
} from "./utils";
import { internal } from "../_generated/api";
import { z } from "zod";

const FETCH_COUNT = 3;

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

const MetaLeadSchema = z.object({
  id: z.string(),
  created_time: z.string(),
  field_data: z
    .array(
      z.object({
        name: z.string(),
        values: z.array(z.string()),
      })
    )
    .default([]),

  ad_id: z.string(),
  ad_name: z.string(),
  adset_id: z.string(),
  adset_name: z.string(),
  campaign_id: z.string(),
  campaign_name: z.string(),
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
        ctx.runAction(internal.meta.action.processPageForms, {
          teamId,
          metaPage,
        })
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
          ctx.runMutation(internal.meta.internal.saveMetaForm, {
            teamId,
            metaPageId: metaPage.id,
            pageName: metaPage.name,
            pageAccessToken: metaPage.access_token,
            form: {
              id: metaForm.id,
              name: metaForm.name,
            },
          })
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
        ctx.runAction(internal.meta.action.processFormLeads, {
          teamId,
          metaFormId: metaForm._id,
          formId: metaForm.formId,
          pageAccessToken: metaForm.pageAccessToken,
        })
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

    let totalLeads = 0;
    let fetchCount = 0;
    let leadsResponse = await fetchMetaLeads(formId, pageAccessToken);

    if (leadsResponse.data && leadsResponse.data.length > 0) {
      const parsedLeads = z.array(MetaLeadSchema).parse(leadsResponse.data);

      await Promise.all(
        parsedLeads.map((lead) =>
          ctx.runMutation(internal.meta.internal.saveMetaLead, {
            teamId,
            metaFormId,
            formId,
            lead,
          })
        )
      );
      totalLeads += parsedLeads.length;
    }
    fetchCount++;

    // Fetch and save paginated leads up to FETCH_COUNT times
    while (leadsResponse.paging?.next && fetchCount < FETCH_COUNT) {
      leadsResponse = await fetchFromUrl(leadsResponse.paging.next);
      if (leadsResponse.data && leadsResponse.data.length > 0) {
        const parsedLeads = z.array(MetaLeadSchema).parse(leadsResponse.data);

        await Promise.all(
          parsedLeads.map((lead) =>
            ctx.runMutation(internal.meta.internal.saveMetaLead, {
              teamId,
              metaFormId,
              formId,
              lead,
            })
          )
        );
        totalLeads += parsedLeads.length;
      }
      fetchCount++;
    }
  },
});

export const handleMetaWebhook = httpAction(async (ctx, request) => {
  return new Response("OK", { status: 200 });
});
