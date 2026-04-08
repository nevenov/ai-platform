# .md-setup Directory

This directory contains AI setup files and chat session history for SimpleAI WebAdmin.

## 📁 Structure

```
.md-setup/
├── primary/              # Pre-prompt setup files (loaded on every AI request)
│   ├── db-schema.md     # Auto-generated database structure
│   └── project-context.md  # User-editable project context
│
└── sessions/            # Chat session history (auto-saved)
    ├── 2026-04-08-14-30_top-customers.md
    ├── 2026-04-08-15-45_analytics-report.md
    └── ... (max 100 most recent sessions)
```

## 🔄 How It Works

### Primary Setup Files

Files in `primary/` are automatically loaded and prepended to the AI system prompt on every chat request. This allows the AI to have instant context about your database structure and project without repeatedly exploring.

**Files:**
- `db-schema.md` - Auto-generated from MySQL (SHOW TABLES + DESCRIBE)
- `project-context.md` - User-editable context and instructions

### Session History

Chat conversations are automatically saved to `sessions/` with the format:
```
{timestamp}_{title}.md
```

- **Max sessions:** 100 (FIFO cleanup)
- **Auto-save:** On page unload or manual save
- **Load:** Via session picker in chat UI

## 🔒 Privacy & Git

**Important:** This entire directory is in `.gitignore` and will NOT be committed to git.

- ✅ Your database structure stays private
- ✅ Chat history is local only
- ✅ Safe for public repositories

## 🛠️ Manual Operations

### Refresh Database Schema

Click the "🔄 Refresh Schema" button in MySQL Explorer to regenerate `db-schema.md`.

### Edit Project Context

Manually edit `primary/project-context.md` to provide custom instructions to the AI.

### Delete Old Sessions

Sessions are automatically cleaned up (FIFO) when limit is reached. You can manually delete files from `sessions/` if needed.

## ⚠️ Do Not Commit

**NEVER** commit this directory to git! It contains sensitive information:
- Database table names and structures
- Private conversation history
- Project-specific details

The `.gitignore` file is configured to exclude this directory.
