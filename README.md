# IT Agent - NestJS Application

Alphra App

## Installation

```bash
npm install
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

## Running the Application

```bash
npm run start:dev

npm run build
npm run start:prod
```



# Ticketing Processing Flow
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
