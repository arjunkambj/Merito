import { Workpool } from "@convex-dev/workpool";
import { v } from "convex/values";
import { action } from "../_generated/server";
import { api, components, internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import {
  fetchMetaPages,
  fetchMetaForms,
  subscribePageToLeadgen,
} from "./utils";

const ACCESS_TOKEN_LIFETIME_MS = 59 * 24 * 60 * 60 * 1000;
const LEADS_LOOKBACK_MS = 60 * 24 * 60 * 60 * 1000;

const webhookUrl = process.env.META_WEBHOOK_URL;
const webhookVerifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;

const metaLeadWorkpool = new Workpool(components.metaWorkpool, {
  maxParallelism: 3,
  retryActionsByDefault: true,
});

type FormWithContext = {
  formId: string;
  formName: string;
  formLocale?: string;
  metaPageId: Id<"metaPages">;
  pageId: string;
  pageAccessToken: string;
};

type SavedPageReference = { pageId: string; metaPageId: Id<"metaPages"> };
type SavedFormReference = { formId: string; metaFormId: Id<"metaForms"> };

export const syncMetaIntegration = action({
  args: {
    teamId: v.string(),
    userId: v.optional(v.string()),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const expiresAt = Date.now() + ACCESS_TOKEN_LIFETIME_MS;

    await ctx.runMutation(api.core.integration.handleIntegration, {
      teamId: args.teamId,
      integrationType: "meta",
      accessToken: args.accessToken,
      accessTokenExpiresAt: expiresAt,
      refreshToken: args.refreshToken,
      refreshTokenExpiresAt: args.refreshToken ? expiresAt : undefined,
    });

    const pages = await fetchMetaPages(args.accessToken);
    if (!pages.length) {
      return { pages: 0, forms: 0, leadsScheduled: 0 };
    }
    const normalizedPages = pages
      .filter((page) => !!page.access_token)
      .map((page) => ({
        pageId: page.id,
        pageName: page.name,
        pageAccessToken: page.access_token,
        pageAccessTokenExpiresAt: expiresAt,
        connectedAppId: page.category,
      }));

    const savedPages = (await ctx.runMutation(
      internal.meta.mutation.replaceMetaPages,
      {
        teamId: args.teamId,
        pages: normalizedPages,
      }
    )) as SavedPageReference[];

    const pageIdToMetaId = new Map<string, Id<"metaPages">>(
      savedPages.map((page) => [page.pageId, page.metaPageId])
    );

    const formsWithContext: FormWithContext[] = [];

    for (const page of normalizedPages) {
      const metaPageId = pageIdToMetaId.get(page.pageId);
      if (!metaPageId) continue;

      const forms = await fetchMetaForms(page.pageId, page.pageAccessToken);

      for (const form of forms) {
        formsWithContext.push({
          formId: form.id,
          formName: form.name,
          formLocale: form.locale,
          metaPageId,
          pageId: page.pageId,
          pageAccessToken: page.pageAccessToken,
        });
      }

      if (!webhookUrl) continue;

      const subscribed = await subscribePageToLeadgen(
        page.pageId,
        page.pageAccessToken,
        webhookUrl,
        webhookVerifyToken
      );

      if (subscribed) {
        await ctx.runMutation(internal.meta.mutation.setPageWebhookStatus, {
          metaPageId,
          isWebhookSubscribed: true,
        });
      }
    }

    const savedForms = (await ctx.runMutation(
      internal.meta.mutation.replaceMetaForms,
      {
        teamId: args.teamId,
        forms: formsWithContext.map(
          ({ metaPageId, formId, formName, formLocale }) => ({
            metaPageId,
            formId,
            formName,
            formLocale,
          })
        ),
      }
    )) as SavedFormReference[];

    const formIdToMetaId = new Map<string, Id<"metaForms">>(
      savedForms.map((form) => [form.formId, form.metaFormId])
    );

    const sinceSeconds = Math.floor((Date.now() - LEADS_LOOKBACK_MS) / 1000);
    let scheduled = 0;

    for (const form of formsWithContext) {
      const metaFormId = formIdToMetaId.get(form.formId);
      if (!metaFormId) continue;

      await metaLeadWorkpool.enqueueAction(
        ctx,
        internal.meta.leads.pullLeadHistory,
        {
          teamId: args.teamId,
          formId: form.formId,
          metaFormId,
          pageId: form.pageId,
          pageAccessToken: form.pageAccessToken,
          since: sinceSeconds,
        },
        { retry: true }
      );
      scheduled += 1;
    }

    return {
      pages: savedPages.length,
      forms: savedForms.length,
      leadsScheduled: scheduled,
    };
  },
});
