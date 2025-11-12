import "server-only";

import { StackServerApp } from "@stackframe/stack";
import { env } from "@/lib/env";

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  secretServerKey: env.STACK_SECRET_SERVER_KEY,
  urls: {
    signIn: "/sign-in",
    afterSignIn: "/overview",
    afterSignUp: "/sign-in",
    afterSignOut: "/",
  },
});
