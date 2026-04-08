/**
 * API Route: Validate Setup Files
 * GET /api/setup/validate
 */

import { NextResponse } from "next/server";
import { validateSetup, loadPrimarySetup } from "@/lib/setup-loader";

export async function GET() {
  try {
    const validation = await validateSetup();
    const content = await loadPrimarySetup();

    return NextResponse.json({
      ...validation,
      contentLength: content.length,
      preview: content.slice(0, 200),
    });
  } catch (error) {
    console.error("[API] Setup validation failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Validation failed",
      },
      { status: 500 }
    );
  }
}
