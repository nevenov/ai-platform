/**
 * API Route: Get Database Schema Status
 * GET /api/schema/status
 */

import { NextResponse } from "next/server";
import { getSchemaAge, schemaExists } from "@/lib/schema-generator";

export async function GET() {
  try {
    const exists = await schemaExists();
    const ageHours = await getSchemaAge();

    return NextResponse.json({
      exists,
      ageHours,
      ageDays: ageHours ? Math.floor(ageHours / 24) : null,
      needsRefresh: ageHours ? ageHours > 168 : true, // 7 days = 168 hours
    });
  } catch (error) {
    console.error("[API] Schema status check failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Status check failed",
      },
      { status: 500 }
    );
  }
}
