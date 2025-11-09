import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  onboarding: defineTable({
    teamId: v.string(),
    isMetaIntegrated: v.boolean(),
    isFormselected: v.boolean(),
    isTeamInvited: v.boolean(),
    isCompleted: v.boolean(),
    hasSyncedLeads: v.boolean(),
    step2CompletedAt: v.optional(v.number()),
    step3CompletedAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("byTeamId", ["teamId"]),

  Integrations: defineTable({
    teamId: v.string(),
    integratedByUserId: v.string(),
    integrationType: v.union(
      v.literal("meta"),
      v.literal("google"),
      v.literal("custom")
    ),
    accessToken: v.optional(v.string()),
    accessTokenExpiresAt: v.number(),
    refreshToken: v.optional(v.string()),
    refreshTokenExpiresAt: v.optional(v.number()),
    isWebhookSubscribed: v.optional(v.boolean()),
    isSuccessfullyIntegrated: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("byTeamId", ["teamId"])
    .index("byIntegrationTypeAndTeamId", ["integrationType", "teamId"]),

  metaPages: defineTable({
    teamId: v.string(),
    metaPageId: v.string(),
    pageName: v.string(),
    pageAccessToken: v.string(),
    isWebhookSubscribed: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("byTeamId", ["teamId"])
    .index("byTeamIdAndMetaPageId", ["teamId", "metaPageId"]),

  metaForms: defineTable({
    teamId: v.string(),
    metaPageId: v.string(),
    formId: v.string(),
    formName: v.string(),
    isPrimary: v.boolean(),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("byTeamId", ["teamId"])
    .index("byTeamIdAndMetaPageIdAndFormId", [
      "teamId",
      "metaPageId",
      "formId",
    ]),

  metaWebhookEvents: defineTable({
    teamId: v.string(),
    pageId: v.string(),
    formId: v.string(),
    leadId: v.optional(v.string()),
    payload: v.any(),
    createdAt: v.number(),
  }).index("byTeamId", ["teamId"]),

  leads: defineTable({
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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("byTeamId", ["teamId"])
    .index("byMetaLeadId", ["metaLeadId"])
    .index("byMetaFormId", ["metaFormId"]),
});

export default schema;
