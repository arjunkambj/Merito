import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    discordId: v.optional(v.string()),
    updatedAt: v.number(),
    createdAt: v.number(),
  }),
});
