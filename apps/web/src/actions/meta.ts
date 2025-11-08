"use server";

import { randomBytes } from "crypto";
import { redis } from "@/lib/redis";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
const META_DIALOG_URL = `https://www.facebook.com/v24.0/dialog/oauth`;
import { stackServerApp } from "@/stack/server";

export const createMetaState = async () => {
  const user = await stackServerApp.getUser({});

  if (!user) {
    console.log("[createMetaState] Error: User not found");
    throw new Error("Team not found");
  }

  const team = await user.listTeams();

  if (team.length === 0) {
    console.log("[createMetaState] Error: No teams found for user");
    throw new Error("Team not found");
  }

  const state = randomBytes(128).toString("hex");

  const cookieStore = await cookies();

  cookieStore.set("meta_state", state, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
  });

  await redis.set(
    state,
    JSON.stringify({ userId: user.id, teamId: team[0]?.id }),
    {
      ex: 60 * 60 * 24,
    }
  );
  return state;
};

export const createMetaOAuthUrl = async (state: string) => {
  const url = new URL(META_DIALOG_URL);
  url.searchParams.set("client_id", env.NEXT_PUBLIC_META_CLIENT_ID);
  url.searchParams.set("redirect_uri", `${env.NEXT_PUBLIC_APP_URL}/api/meta/`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);
  url.searchParams.set(
    "scope",
    [
      "business_management",
      "pages_show_list",
      "pages_manage_metadata",
      "pages_manage_ads",
      "leads_retrieval",
      "ads_read",
      "public_profile",
      "email",
    ].join(",")
  );
  console.log("[createMetaOAuthUrl] OAuth URL created successfully");
  return url.toString();
};
