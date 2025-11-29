# IT Agent - NestJS Application

Alphora Agent 101 — Europe's first AI-Native MSP Support Platform. An AI agent that autonomously resolves L1/L2 IT support tickets by orchestrating actions across PSA systems, RMM tools, and remote access solutions.

## Installation

```bash
npm install
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=it_agent

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSION=1536
```

## Running the Application

```bash
# Start PostgreSQL with pgvector
docker-compose up -d postgres

# Development
npm run start:dev

# Production
npm run build
npm run start:prod

# Seed database
npm run db:seed
```

## Ticket Processing Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  1. WEBHOOK RECEIVES TICKET                                                  │
│     POST /psa/webhook/tickets                                               │
│     { clientId, title, body, priority }                                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  2. SAVE TO DATABASE                                                         │
│     PsaController → PsaService.createTicket()                               │
│     Ticket saved to PostgreSQL                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  3. TRIGGER AGENT (Background)                                               │
│     AlphoraAgentService.handleNewTicket(ticket)                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  4. RAG QUERY                                                                │
│     RagOrchestratorService.runRagQuery(title, body)                         │
│                                                                              │
│     a) CLASSIFY INTENT                                                       │
│        - Scan keywords → password_reset, system_restart, backup_failure...  │
│        - Calculate confidence score (0-1)                                   │
│        - Determine if automatable                                           │
│                                                                              │
│     b) VECTOR SEARCH                                                         │
│        - Generate embedding for ticket text (OpenAI API)                    │
│        - Search knowledge_base table using pgvector similarity              │
│        - Return top 5 matching KB articles                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  5. DECISION: AUTOMATE or ESCALATE?                                          │
│                                                                              │
│     IF confidence < 0.3 OR intent = unknown OR not automatable:             │
│        → ESCALATE to human technician                                       │
│                                                                              │
│     ELSE:                                                                    │
│        → AUTOMATE                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                         ┌──────────┴──────────┐
                         ▼                     ▼
┌────────────────────────────────┐  ┌────────────────────────────────┐
│  6a. ESCALATION                │  │  6b. ACTION PLAN               │
│                                │  │                                │
│  EscalationService.escalate() │  │  ActionPlannerService          │
│  - Log reason                  │  │  .createActionPlan()           │
│  - Suggest next steps          │  │                                │
│  - Notify human                │  │  Generate steps like:          │
│                                │  │  1. Verify user identity       │
│                                │  │  2. Reset password in AD       │
│                                │  │  3. Send temp password         │
│                                │  │  4. Update ticket              │
└────────────────────────────────┘  └────────────────────────────────┘
                                                   │
                                                   ▼
                                    ┌────────────────────────────────┐
                                    │  7. PRINT ACTION PLAN          │
                                    │     (Ready for execution)      │
                                    │                                │
                                    │  Future: Execute via RMM/API   │
                                    └────────────────────────────────┘
```

## Example

**Ticket comes in:**
```json
{
  "clientId": "cisco-uuid",
  "title": "Password expired - cannot login",
  "body": "User John cannot login, password expired"
}
```

**Agent processes:**
1. **Intent**: `password_reset` (confidence: 0.75)
2. **KB Search**: Finds "Active Directory Password Reset Procedure" (similarity: 0.92)
3. **Decision**: AUTOMATE ✓
4. **Action Plan**: 4 steps using `active_directory` and `secure_messaging` tools


## Follow up improvements
- Integrate with RMM APIs to auto-execute actions
- Add more PSA and RMM tool integrations
- Enhance intent classification (LLM-based classifier)
