import { NextResponse, NextRequest } from "next/server";
import { ConvertMetaCodeToAccessToken } from "@/integration/meta";
import { cookies } from "next/headers";
import { redis } from "@/lib/redis";
import { fetchAction, fetchMutation } from "convex/nextjs";
import { api } from "@repo/backend/convex/_generated/api";
import { z } from "zod";

const accessTokenSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
});

export async function GET(request: NextRequest) {
  console.log(
    "[API Meta Route] Step 1: Extracting state and code from request"
  );
  const params = request.nextUrl.searchParams;
  const state = params.get("state");
  const code = params.get("code");

  if (!state || !code) {
    return NextResponse.json({ error: "State is required" }, { status: 400 });
  }
  const cookieStore = await cookies();
  const cookieState = cookieStore.get("meta_state");

  if (!cookieState || cookieState.value !== state) {
    return NextResponse.json({ error: "Invalid state" }, { status: 400 });
  }

  const userState = await redis.get<{ userId: string; teamId: string }>(state);

  if (!userState) {
    return NextResponse.json({ error: "Invalid state" }, { status: 400 });
  }

  const accessTokenData = await ConvertMetaCodeToAccessToken(code);

  const TokenData = accessTokenSchema.parse(accessTokenData);

  await fetchAction(
    api.meta.action.handleMetaCallback,
    {
      teamId: userState.teamId,
      accessToken: TokenData.access_token,
      integratedByUserId: userState.userId,
    },
    {}
  );

  await fetchMutation(
    api.core.onboarding.createOnboarding,
    {
      teamId: userState.teamId,
    },
    {}
  );

  await redis.del(state);
  cookieStore.delete("meta_state");

  return NextResponse.redirect(
    new URL("/onboarding/meta?success=true", request.nextUrl.origin)
  );
}
