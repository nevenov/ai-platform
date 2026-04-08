/**
 * API Route: Generate Database Schema
 * POST /api/schema/generate
 */

import { NextResponse } from "next/server";
import {
  generateSchema,
  saveSchema,
  deleteSchema,
} from "@/lib/schema-generator";

export async function POST() {
  try {
    console.log("[API] Starting schema generation...");

    // Step 1: Delete old schema file
    await deleteSchema();

    // Step 2: Generate new schema
    const schemaInfo = await generateSchema();

    // Step 3: Save to file
    await saveSchema(schemaInfo);

    return NextResponse.json({
      success: true,
      message: "Schema generated successfully",
      data: {
        databaseName: schemaInfo.databaseName,
        tableCount: schemaInfo.tableCount,
        totalColumns: schemaInfo.totalColumns,
        generatedAt: schemaInfo.generatedAt,
      },
    });
  } catch (error) {
    console.error("[API] Schema generation failed:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Schema generation failed",
      },
      { status: 500 }
    );
  }
}
