import { NextResponse, NextRequest } from "next/server";
import {
  FetchMetaAccessToken,
  FetchMetaRefreshToken,
  VerifyMetaState,
} from "@/integration/meta";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const state = params.get("state");
  const code = params.get("code");

  if (!state || !code) {
    return NextResponse.json({ error: "State is required" }, { status: 400 });
  }

  const verifiedState = await VerifyMetaState(state);
  if (!verifiedState) {
    return NextResponse.json({ error: "Invalid state" }, { status: 400 });
  }

  const accessTokenData = await FetchMetaAccessToken(code);
  console.log("Getting access token", accessTokenData);

  const longLivedAccessTokenData = await FetchMetaRefreshToken(
    accessTokenData.access_token
  );

  return NextResponse.json({ success: true, data: longLivedAccessTokenData });
}
