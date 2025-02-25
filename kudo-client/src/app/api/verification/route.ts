import { NextResponse } from "next/server";

interface VerificationRequest {
  address: string;
  minAbilityScore: string;
}

async function calculateAbilityScore(): Promise<string> {
  return "6200000000000000000";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VerificationRequest;
    const { minAbilityScore } = body;

    const abilityScore = await calculateAbilityScore();

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
