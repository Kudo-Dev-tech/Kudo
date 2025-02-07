import { NextResponse } from "next/server";

interface VerificationRequest {
  address: string;
  minAbilityScore: string;
}

interface CookieFunResponse {
  ok: {
    mindshare: number;
    marketCap: number;
    followersCount: number;
    smartFollowersCount: number;
    averageEngagementsCount: number;
  };
  success: boolean;
  error: string | null;
}

const TWITTER_USERNAMES_BY_ADDRESS: Record<string, string> = {
  "0x6576ec1047774a35b063fda60743355d699cf09e": "luna_virtuals",
  "0xdf782913fb9ccb9968fd4d7ccade4a946abb3673": "degenspartanai",
  "0x660551fa0f558f8b052fd2573acd3782f68cfde4": "kolin_ai",
};

async function calculateAbilityScore(contractAddress: string): Promise<string> {
  const interval = "_3Days";
  const apiKey = process.env.COOKIE_FUN_API_KEY;

  if (!apiKey) {
    throw new Error("COOKIE_FUN_API_KEY environment variable is not set");
  }

  const normalizedAddress = contractAddress.toLowerCase();
  const twitterUsername = TWITTER_USERNAMES_BY_ADDRESS[normalizedAddress];

  if (!twitterUsername) {
    return "0";
  }

  try {
    const response = await fetch(
      `https://api.cookie.fun/v2/agents/twitterUsername/${twitterUsername}?interval=${interval}`,
      {
        headers: {
          "x-api-key": apiKey,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const data = (await response.json()) as CookieFunResponse;

    if (!data.success || !data.ok) {
      throw new Error("Failed to fetch agent data");
    }

    const mindShareScore = (10 * Math.min(data.ok.mindshare, 0.1)) / 0.1;
    const marketCapScore =
      (10 * Math.min(data.ok.marketCap, 100_000_000)) / 100_000_000;
    const followerCountScore =
      (10 * Math.min(data.ok.followersCount, 100_000)) / 100_000;
    const smartFollowerCountScore =
      (10 * Math.min(data.ok.smartFollowersCount, 1_000)) / 1_000;
    const averageEngagementCountScore =
      (10 * Math.min(data.ok.averageEngagementsCount, 200)) / 200;

    const abilityScore =
      (mindShareScore +
        marketCapScore +
        followerCountScore +
        smartFollowerCountScore +
        averageEngagementCountScore) /
      5;

    const scaledAbilityScore = Math.floor(abilityScore * 10 ** 18).toString();

    return scaledAbilityScore;
  } catch (error) {
    throw new Error(`Failed to fetch data from API: ${error}`);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VerificationRequest;
    const { address, minAbilityScore } = body;

    const abilityScore = await calculateAbilityScore(address);

    const isVerified = BigInt(abilityScore) >= BigInt(minAbilityScore);

    return NextResponse.json({
      isVerified,
      abilityScore,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body or processing error: " + error },
      { status: 400 },
    );
  }
}
