/**
 * Setup Loader
 * Loads all .md files from .md-setup/primary/ and combines them
 * for inclusion in AI system prompt
 */

import fs from "fs/promises";
import path from "path";

const PRIMARY_SETUP_DIR = path.join(process.cwd(), ".md-setup", "primary");

interface SetupFile {
  filename: string;
  content: string;
}

/**
 * Load all primary setup files and combine into single string
 */
export async function loadPrimarySetup(): Promise<string> {
  try {
    // Check if directory exists
    try {
      await fs.access(PRIMARY_SETUP_DIR);
    } catch {
      console.log("[Setup] Primary setup directory not found, skipping setup files");
      return "";
    }

    // Read all .md files
    const files = await fs.readdir(PRIMARY_SETUP_DIR);
    const mdFiles = files.filter((f) => f.endsWith(".md"));

    if (mdFiles.length === 0) {
      console.log("[Setup] No .md files found in primary setup");
      return "";
    }

    console.log(`[Setup] Loading ${mdFiles.length} setup file(s)`);

    // Load each file
    const setupFiles: SetupFile[] = [];
    for (const filename of mdFiles) {
      const filePath = path.join(PRIMARY_SETUP_DIR, filename);
      try {
        const content = await fs.readFile(filePath, "utf-8");
        setupFiles.push({ filename, content });
        console.log(`[Setup] Loaded ${filename} (${content.length} chars)`);
      } catch (error) {
        console.error(`[Setup] Failed to load ${filename}:`, error);
      }
    }

    // Combine files
    const combined = combineSetupFiles(setupFiles);
    console.log(`[Setup] Combined setup: ${combined.length} chars`);

    return combined;
  } catch (error) {
    console.error("[Setup] Failed to load primary setup:", error);
    return "";
  }
}

/**
 * Combine multiple setup files into single formatted string
 */
function combineSetupFiles(files: SetupFile[]): string {
  if (files.length === 0) return "";

  let combined = "# 📋 System Setup\n\n";
  combined += "**The following context is provided to help you understand the system:**\n\n";
  combined += "---\n\n";

  for (const file of files) {
    combined += `## From: ${file.filename}\n\n`;
    combined += file.content;
    combined += "\n\n---\n\n";
  }

  return combined;
}

/**
 * Validate that setup files are loaded correctly
 */
export async function validateSetup(): Promise<{
  valid: boolean;
  filesFound: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let filesFound = 0;

  try {
    await fs.access(PRIMARY_SETUP_DIR);
  } catch {
    errors.push("Primary setup directory does not exist");
    return { valid: false, filesFound: 0, errors };
  }

  try {
    const files = await fs.readdir(PRIMARY_SETUP_DIR);
    const mdFiles = files.filter((f) => f.endsWith(".md"));
    filesFound = mdFiles.length;

    if (mdFiles.length === 0) {
      errors.push("No .md files found in primary setup directory");
    }
  } catch (error) {
    errors.push(`Failed to read setup directory: ${error}`);
  }

  return {
    valid: errors.length === 0,
    filesFound,
    errors,
  };
}
