import { internalMutation, query, mutation } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

export const saveIntegration = internalMutation({
  args: {
    teamId: v.string(),
    integrationType: v.union(v.literal("meta"), v.literal("google")),
    integratedByUserId: v.string(),
    accessToken: v.string(),
    accessTokenExpiresAt: v.number(),
    refreshToken: v.optional(v.string()),
    refreshTokenExpiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const {
      teamId,
      integrationType,
      integratedByUserId,
      accessToken,
      accessTokenExpiresAt,
      refreshToken,
      refreshTokenExpiresAt,
    } = args;

    const integration = await ctx.db
      .query("Integrations")
      .withIndex("byIntegrationTypeAndTeamId", (q) =>
        q.eq("integrationType", integrationType).eq("teamId", teamId)
      )
      .first();

    if (integration) {
      await ctx.db.patch(integration._id, {
        accessToken,
        accessTokenExpiresAt,
        refreshToken,
        integratedByUserId,
        refreshTokenExpiresAt,
        isWebhookSubscribed: false,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("Integrations", {
        teamId,
        integrationType,
        integratedByUserId,
        accessToken,
        accessTokenExpiresAt,
        isWebhookSubscribed: false,
        refreshToken,
        isSuccessfullyIntegrated: false,
        refreshTokenExpiresAt,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    return true;
  },
});

export const updateSuccessfullyIntegrated = internalMutation({
  args: {
    teamId: v.string(),
    integrationType: v.union(v.literal("meta"), v.literal("google")),
  },
  handler: async (ctx, args) => {
    const { teamId, integrationType } = args;

    const integration = await ctx.db
      .query("Integrations")
      .withIndex("byIntegrationTypeAndTeamId", (q) =>
        q.eq("integrationType", integrationType).eq("teamId", teamId)
      )
      .first();

    if (integration) {
      await ctx.db.patch(integration._id, {
        isSuccessfullyIntegrated: true,
        updatedAt: Date.now(),
      });
    }
    return true;
  },
});

// TODO: NEED TO ADD STACKAUTH HERE
export const getAllMetaForms = query({
  args: {
    teamId: v.string(),
  },
  handler: async (ctx, args) => {
    const { teamId } = args;

    const metaForms = await ctx.db
      .query("metaForms")
      .withIndex("byTeamId", (q) => q.eq("teamId", teamId))
      .collect();

    return metaForms.map((metaForm) => ({
      id: metaForm._id,
      name: metaForm.formName,
      pageId: metaForm.metaPageId,
      isPrimary: metaForm.isPrimary,
    }));
  },
});

export const createOnboarding = mutation({
  args: {
    teamId: v.string(),
  },
  handler: async (ctx, args) => {
    const { teamId } = args;

    const existingOnboarding = await ctx.db
      .query("onboarding")
      .withIndex("byTeamId", (q) => q.eq("teamId", teamId))
      .first();

    if (existingOnboarding) {
      await ctx.db.patch(existingOnboarding._id, {
        isMetaIntegrated: true,
        isFormselected: false,
        isTeamInvited: false,
        hasSyncedLeads: false,
        isCompleted: false,
        createdAt: Date.now(),
      });
    } else {
      await ctx.db.insert("onboarding", {
        teamId,
        isMetaIntegrated: true,
        isFormselected: false,
        isTeamInvited: false,
        hasSyncedLeads: false,
        isCompleted: false,
        createdAt: Date.now(),
      });
    }
    return true;
  },
});

// TODO: NEED TO ADD STACKAUTH HERE
export const updateOnboardingStep = mutation({
  args: {
    teamId: v.string(),
  },
  handler: async (ctx, args) => {
    const { teamId } = args;

    const onboarding = await ctx.db
      .query("onboarding")
      .withIndex("byTeamId", (q) => q.eq("teamId", teamId))
      .first();

    if (onboarding) {
      await ctx.db.patch(onboarding._id, {
        step2CompletedAt: Date.now(),
        isFormselected: true,
      });
    } else {
      await ctx.db.insert("onboarding", {
        teamId,
        isMetaIntegrated: true,
        hasSyncedLeads: false,
        step2CompletedAt: Date.now(),
        isFormselected: true,
        isTeamInvited: false,
        isCompleted: false,
        createdAt: Date.now(),
      });
    }
    return true;
  },
});

// TODO: NEED TO ADD STACKAUTH HERE
export const togglePrimaryForm = mutation({
  args: {
    metaFormId: v.id("metaForms"),
    isPrimary: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.metaFormId, {
      isPrimary: args.isPrimary,
      updatedAt: Date.now(),
    });
    return true;
  },
});

// TODO: NEED TO ADD STACKAUTH HERE
export const updatePrimaryForms = mutation({
  args: {
    metaFormIds: v.array(v.id("metaForms")),
    teamId: v.string(),
  },
  handler: async (ctx, args) => {
    const metaFormIds = args.metaFormIds as Id<"metaForms">[];
    const metaFormIdSet = new Set(metaFormIds);

    const allForms = await ctx.db
      .query("metaForms")
      .withIndex("byTeamId", (q) => q.eq("teamId", args.teamId))
      .collect();

    await Promise.all(
      allForms.map((form) =>
        ctx.db.patch(form._id, {
          isPrimary: metaFormIdSet.has(form._id),
          updatedAt: Date.now(),
        })
      )
    );

    return true;
  },
});

// TODO: NEED TO ADD STACKAUTH HERE
export const completeOnboarding = mutation({
  args: {
    teamId: v.string(),
  },
  handler: async (ctx, args) => {
    const { teamId } = args;
    const onboarding = await ctx.db
      .query("onboarding")
      .withIndex("byTeamId", (q) => q.eq("teamId", teamId))
      .first();
    if (onboarding) {
      await ctx.db.patch(onboarding._id, {
        teamId,
        step3CompletedAt: Date.now(),
        isTeamInvited: true,
      });
    }
  },
});
