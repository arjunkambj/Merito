import { StackClientApp } from "@stackframe/stack";
import { env } from "@/lib/env";

export const stackClientApp = new StackClientApp({
  tokenStore: "cookie",
  projectId: env.NEXT_PUBLIC_STACK_PROJECT_ID,
  publishableClientKey: env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
});
