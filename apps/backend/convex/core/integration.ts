import { internalMutation, query } from "../_generated/server";
import { v } from "convex/values";

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
        isWebhookSubscribed: true,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("Integrations", {
        teamId,
        integrationType,
        integratedByUserId,
        accessToken,
        accessTokenExpiresAt,
        isWebhookSubscribed: true,
        refreshToken,
        refreshTokenExpiresAt,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    return true;
  },
});
