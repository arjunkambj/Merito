import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const updateFormSelection = mutation({
  args: {
    selectedFormIds: v.array(v.id("metaForms")),
  },
  handler: async (ctx) => {},
});
