#!/bin/bash
cd /c/Users/123/.gemini/antigravity/scratch/Multi-Agent-Builder--Otogent

# Stage all changes
git add -A

# Get current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Current branch: $BRANCH"

# Create commit message
COMMIT_MSG="feat: implement fully functional Composio credential integration

- Add credential validation for OpenAI, Anthropic, Gemini, HuggingFace
- Add 'Test Connection' button to credential form
- Implement OAuth callback handler for Composio integrations
- Add ComposioIntegration database model
- Create connected integrations management UI
- Add disconnect/revoke functionality
- Enhance Composio marketplace with real-time status
- Implement TRPC endpoints for credential testing and integration management

Features:
- Users can now test API credentials before saving
- Browse and search 11,000+ Composio integrations
- Connect OAuth integrations (Gmail, GitHub, Slack, etc)
- View and manage all connected integrations
- Real-time validation feedback with success/error indicators
- Secure credential storage with encryption

Files added:
- src/features/credentials/server/validators.ts
- src/features/credentials/components/credential-form.tsx
- src/app/api/composio-callback.ts

Files modified:
- prisma/schema.prisma
- src/features/credentials/server/routers.ts
- src/trpc/routers/composio.ts
- src/features/credentials/components/composio-marketplace.tsx
- src/app/(dashboard)/(rest)/credentials/[credentialId]/page.tsx
- src/app/(dashboard)/(rest)/credentials/new/page.tsx

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

# Commit
git commit -m "$COMMIT_MSG"

# Push to current branch
git push origin $BRANCH

echo "✅ Pushed to GitHub on branch: $BRANCH"
