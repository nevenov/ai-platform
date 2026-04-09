/**
 * Session Manager
 * Handles chat session persistence to .md-setup/sessions/
 */

import fs from "fs/promises";
import path from "path";

const SESSIONS_DIR = path.join(process.cwd(), ".md-setup", "sessions");
const MAX_SESSIONS = 100; // FIFO cleanup after 100 sessions

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface SessionMetadata {
  id: string;
  title: string;
  created: Date;
  messageCount: number;
  filePath: string;
}

/**
 * Create a new session and save to file
 */
export async function createSession(
  messages: Message[],
  customTitle?: string
): Promise<{ id: string; title: string }> {
  // Ensure directory exists
  await fs.mkdir(SESSIONS_DIR, { recursive: true });

  // Generate session ID and title
  const timestamp = new Date();
  const id = formatTimestamp(timestamp);
  const title = customTitle || generateTitleFromFirstMessage(messages);
  const filename = `${id}_${slugify(title)}.md`;
  const filePath = path.join(SESSIONS_DIR, filename);

  console.log(`[Session] Creating session with ${messages.length} messages, title: "${title}"`);

  // Format session as Markdown
  const markdown = formatSessionAsMarkdown(title, timestamp, messages);

  // Save to file
  await fs.writeFile(filePath, markdown, "utf-8");

  console.log(`[Session] Created: ${filename}`);

  // Check if cleanup needed (FIFO)
  await cleanupOldSessionsIfNeeded();

  // Return both id and title
  return { id, title };
}

/**
 * Update an existing session with new messages
 */
export async function updateSession(
  id: string,
  messages: Message[],
  customTitle?: string
): Promise<boolean> {
  try {
    await fs.access(SESSIONS_DIR);
  } catch {
    return false;
  }

  // Find file with matching ID
  const files = await fs.readdir(SESSIONS_DIR);
  const matchingFile = files.find((f) => f.startsWith(`${id}_`));

  if (!matchingFile) {
    console.error(`[Session] Session ${id} not found for update`);
    return false;
  }

  const oldFilePath = path.join(SESSIONS_DIR, matchingFile);

  // Get title (use custom or keep existing from filename)
  let title = customTitle;
  if (!title) {
    const metadata = parseSessionFilename(matchingFile);
    title = metadata?.title || generateTitleFromFirstMessage(messages);
  }

  // Generate new filename (keep same ID, update slug if title changed)
  const newFilename = `${id}_${slugify(title)}.md`;
  const newFilePath = path.join(SESSIONS_DIR, newFilename);

  // Get original creation timestamp
  const oldContent = await fs.readFile(oldFilePath, "utf-8");
  const createdMatch = oldContent.match(/\*\*Created:\*\* (.+)/);
  const createdTimestamp = createdMatch ? new Date(createdMatch[1]) : new Date();

  // Format with updated messages
  const markdown = formatSessionAsMarkdown(title, createdTimestamp, messages);

  // Save to file
  await fs.writeFile(newFilePath, markdown, "utf-8");

  // Delete old file if name changed
  if (oldFilePath !== newFilePath) {
    await fs.unlink(oldFilePath);
  }

  console.log(`[Session] Updated: ${newFilename}`);
  return true;
}

/**
 * List all sessions (sorted by date, newest first)
 */
export async function listSessions(): Promise<SessionMetadata[]> {
  try {
    await fs.access(SESSIONS_DIR);
  } catch {
    // Directory doesn't exist yet
    return [];
  }

  const files = await fs.readdir(SESSIONS_DIR);
  const mdFiles = files.filter((f) => f.endsWith(".md") && f !== ".gitkeep");

  const sessions: SessionMetadata[] = [];

  for (const filename of mdFiles) {
    try {
      const metadata = parseSessionFilename(filename);
      if (metadata) {
        sessions.push(metadata);
      }
    } catch (error) {
      console.error(`[Session] Failed to parse ${filename}:`, error);
    }
  }

  // Sort by date (newest first)
  sessions.sort((a, b) => b.created.getTime() - a.created.getTime());

  return sessions;
}

/**
 * Load a specific session by ID
 */
export async function loadSession(id: string): Promise<{ title: string; messages: Message[] } | null> {
  try {
    await fs.access(SESSIONS_DIR);
  } catch {
    return null;
  }

  // Find file with matching ID
  const files = await fs.readdir(SESSIONS_DIR);
  const matchingFile = files.find((f) => f.startsWith(`${id}_`));

  if (!matchingFile) {
    return null;
  }

  const filePath = path.join(SESSIONS_DIR, matchingFile);
  const content = await fs.readFile(filePath, "utf-8");

  return parseSessionMarkdown(content);
}

/**
 * Delete a session by ID
 */
export async function deleteSession(id: string): Promise<boolean> {
  try {
    const files = await fs.readdir(SESSIONS_DIR);
    const matchingFile = files.find((f) => f.startsWith(`${id}_`));

    if (!matchingFile) {
      return false;
    }

    const filePath = path.join(SESSIONS_DIR, matchingFile);
    await fs.unlink(filePath);

    console.log(`[Session] Deleted: ${matchingFile}`);
    return true;
  } catch (error) {
    console.error(`[Session] Failed to delete ${id}:`, error);
    return false;
  }
}

/**
 * Cleanup oldest sessions if limit exceeded (FIFO)
 */
async function cleanupOldSessionsIfNeeded(): Promise<void> {
  const sessions = await listSessions();

  if (sessions.length <= MAX_SESSIONS) {
    return; // No cleanup needed
  }

  // Sort by date (oldest first)
  const sortedSessions = [...sessions].sort(
    (a, b) => a.created.getTime() - b.created.getTime()
  );

  // Delete oldest sessions to get back to limit
  const toDelete = sessions.length - MAX_SESSIONS;
  for (let i = 0; i < toDelete; i++) {
    const session = sortedSessions[i];
    await fs.unlink(session.filePath);
    console.log(`[Session] FIFO cleanup: deleted ${path.basename(session.filePath)}`);
  }
}

/**
 * Format session as Markdown
 */
function formatSessionAsMarkdown(
  title: string,
  created: Date,
  messages: Message[]
): string {
  let md = `# Chat Session: ${title}\n\n`;
  md += `**Created:** ${created.toISOString()}\n`;
  md += `**Messages:** ${messages.length}\n\n`;
  md += `---\n\n`;

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const time = msg.timestamp.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    md += `## Message ${i + 1} (${msg.role}) - ${time}\n\n`;
    md += `${msg.content}\n\n`;
  }

  return md;
}

/**
 * Parse session Markdown back to messages
 */
function parseSessionMarkdown(markdown: string): { title: string; messages: Message[] } {
  const messages: Message[] = [];
  const lines = markdown.split("\n");

  // Extract title from first line: # Chat Session: {title}
  let title = "Untitled Session";
  const titleMatch = lines[0]?.match(/^# Chat Session: (.+)$/);
  if (titleMatch) {
    title = titleMatch[1].trim();
    
    // Handle empty or whitespace-only titles
    if (!title || title === "") {
      title = "Untitled Session";
    }
  }

  let currentMessage: Partial<Message> | null = null;
  let contentLines: string[] = [];

  for (const line of lines) {
    // Match message header: ## Message 1 (user) - 14:30:15
    const headerMatch = line.match(/^## Message \d+ \((user|assistant)\) - (.+)$/);

    if (headerMatch) {
      // Save previous message
      if (currentMessage && contentLines.length > 0) {
        messages.push({
          role: currentMessage.role!,
          content: contentLines.join("\n").trim(),
          timestamp: currentMessage.timestamp!,
        });
      }

      // Start new message
      currentMessage = {
        role: headerMatch[1] as "user" | "assistant",
        timestamp: new Date(), // Use current time as fallback
      };
      contentLines = [];
    } else if (currentMessage && line.trim()) {
      contentLines.push(line);
    }
  }

  // Save last message
  if (currentMessage && contentLines.length > 0) {
    messages.push({
      role: currentMessage.role!,
      content: contentLines.join("\n").trim(),
      timestamp: currentMessage.timestamp!,
    });
  }

  return { title, messages };
}

/**
 * Parse session filename to metadata
 */
function parseSessionFilename(filename: string): SessionMetadata | null {
  // Format: 2026-04-08-14-30_title-slug.md
  const match = filename.match(/^(\d{4}-\d{2}-\d{2}-\d{2}-\d{2})_(.+)\.md$/);

  if (!match) {
    return null;
  }

  const [, timestampStr, titleSlug] = match;
  
  // Convert slug back to title (replace hyphens with spaces)
  let title = titleSlug.replace(/-/g, " ").trim();
  
  // Handle empty or underscore-only slugs
  if (!title || title === "_" || title === "") {
    title = "Untitled Session";
  }

  // Parse timestamp (YYYY-MM-DD-HH-MM)
  const [year, month, day, hour, minute] = timestampStr.split("-").map(Number);
  const created = new Date(year, month - 1, day, hour, minute);

  return {
    id: timestampStr,
    title,
    created,
    messageCount: 0, // Will be populated if needed
    filePath: path.join(SESSIONS_DIR, filename),
  };
}

/**
 * Generate title from first user message
 */
function generateTitleFromFirstMessage(messages: Message[]): string {
  const firstUserMessage = messages.find((m) => m.role === "user");

  if (!firstUserMessage) {
    console.warn("[Session] No user message found for title generation");
    return "New Session";
  }

  // Take first 5 words
  const words = firstUserMessage.content.trim().split(/\s+/).slice(0, 5);
  const title = words.join(" ");
  
  console.log("[Session] Generated title:", title, "from message:", firstUserMessage.content.substring(0, 50));
  
  return title || "New Session";
}

/**
 * Format timestamp as YYYY-MM-DD-HH-MM
 */
function formatTimestamp(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}-${hour}-${minute}`;
}

/**
 * Slugify string for filename (lowercase, hyphens, alphanumeric)
 */
function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .trim()
    // Keep Unicode letters (including Cyrillic), numbers, spaces, and hyphens
    .replace(/[^\p{L}\p{N}\s-]/gu, "") // Use Unicode-aware regex
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .slice(0, 50); // Limit length
  
  // Return 'untitled' if slug is empty
  return slug || "untitled";
}
