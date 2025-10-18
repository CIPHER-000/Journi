# 🔄 Project Refactoring & Cleanup Plan

**Goal**: Clean, modular, well-organized codebase  
**Constraint**: ALL functionality must remain intact  
**Created**: 2025-01-18

---

## 🎯 Guiding Principles

1. **Zero Breaking Changes** - Every feature works exactly as before
2. **Preserve CrewAI Workflow** - Do not touch agent logic
3. **Maintain Aesthetics** - UI/UX stays frozen
4. **Improve Maintainability** - Smaller files, better organization
5. **Add Safety Nets** - Tests before refactoring

---

## 📊 Current State Analysis

### Large Files Identified 🔴

| File | Size | Concern | Refactor Priority |
|------|------|---------|-------------------|
| `frontend/src/pages/JourneyMapPage.tsx` | ~35 KB | Extremely large | 🔴 HIGH |
| `backend/src/services/job_manager.py` | 32.9 KB | Critical logic | 🟡 MEDIUM |
| `frontend/src/pages/HomePage.tsx` | ~31 KB | Very large | 🔴 HIGH |
| `frontend/src/pages/CreateJourneyPage.tsx` | ~27 KB | Large | 🟡 MEDIUM |
| `backend/src/agents/crew_coordinator.py` | 17.3 KB | Functional | 🟢 LOW |
| `backend/src/services/auth_service.py` | 17.1 KB | Functional | 🟢 LOW |

---

## ✅ Already Completed

### Phase 1: Documentation & UI Improvements ✅
- [x] UI redesign with Figma AI patterns
- [x] Green lightning bolt logo added
- [x] Windsurf MCP configuration
- [x] Figma AI Code reference added
- [x] Design screenshots documented
- [x] CrewAI workflow documentation
- [x] HTTP polling architecture documentation
- [x] Work committed and pushed to remote

---

## 📁 Phase 2: Project Organization (CURRENT)

### 2.1 Root Directory Cleanup 📁

**Current State** (Cluttered):
```
Journi/
├── CLAUDE.md
├── FIX_AUTH_GUIDE.md
├── JOURNEY_FIXES_SUMMARY.md
├── JOURNEY_NULL_REFERENCE_FIX.md
├── MIGRATION_INSTRUCTIONS.md
├── WARP.md
├── gpt5.md
├── gpt5_analysis.md
├── gpt5_collaboration.md
├── add_job_tracking_columns.sql
├── test_render_websocket.html
├── test_websocket_integration.py
├── (many other files)
```

**Target Structure** (Clean):
```
Journi/
├── README.md (main project readme)
├── docs/ (all documentation)
│   ├── README.md (docs index)
│   ├── CREWAI_WORKFLOW_DOCUMENTATION.md ✅
│   ├── POLLING_ARCHITECTURE.md ✅
│   ├── REFACTORING_PLAN.md (this file) ✅
│   ├── setup/
│   │   └── MIGRATION_INSTRUCTIONS.md
│   ├── guides/
│   │   ├── FIX_AUTH_GUIDE.md
│   │   └── best-practices.md
│   ├── fixes/
│   │   ├── JOURNEY_FIXES_SUMMARY.md
│   │   └── JOURNEY_NULL_REFERENCE_FIX.md
│   └── ai-assistants/
│       ├── CLAUDE.md
│       ├── WARP.md
│       ├── gpt5.md
│       ├── gpt5_analysis.md
│       └── gpt5_collaboration.md
├── scripts/ (utility scripts)
│   ├── database/
│   │   └── add_job_tracking_columns.sql
│   └── testing/
│       ├── test_render_websocket.html
│       └── test_websocket_integration.py
├── backend/
├── frontend/
└── Figma AI Code/ (⚠️ REFERENCE ONLY - won't merge to main)
```

---

### 2.2 Backend Organization 🔧

**Current**:
```
backend/
├── main.py (25.5 KB - FastAPI app)
├── run.py
├── best_practices_doc_server.py
├── test_mcp_server.py
├── add_name_column.sql
├── add_name_column_simple.sql
├── delete_user_properly.sql
├── USER_DELETION_GUIDE.md
└── src/
```

**Target**:
```
backend/
├── main.py (keep as is - entry point)
├── run.py (keep - helper script)
├── src/
│   ├── agents/ (no changes - working well)
│   ├── services/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── utils/ (NEW)
├── tests/ (NEW)
│   ├── test_agents.py
│   ├── test_job_manager.py
│   └── test_api_routes.py
├── scripts/ (NEW - move from root)
│   ├── database/
│   │   ├── add_name_column.sql
│   │   ├── add_name_column_simple.sql
│   │   └── delete_user_properly.sql
│   └── mcp/
│       ├── best_practices_doc_server.py
│       └── test_mcp_server.py
└── docs/
    └── USER_DELETION_GUIDE.md
```

---

### 2.3 Frontend Organization ⚛️

**Current**:
```
frontend/src/
├── pages/ (13 pages - some large)
├── components/
├── services/
├── context/
├── hooks/
├── types/
└── utils/
```

**Target**:
```
frontend/src/
├── pages/ (keep, but refactor large ones)
├── components/
│   ├── common/ (reusable components)
│   ├── journey/ (journey-specific)
│   ├── dashboard/ (dashboard-specific)
│   └── layout/ (Header, Footer, etc.)
├── services/
│   ├── api/ (NEW - organize API calls)
│   │   ├── journeyApi.ts
│   │   ├── authApi.ts
│   │   └── analyticsApi.ts
│   └── agentService.ts (keep)
├── hooks/
│   ├── useJourneyPolling.ts (NEW - extract polling logic)
│   └── useAuth.ts
├── types/
├── utils/
└── test/ (NEW)
    ├── setup.ts
    └── utils.tsx
```

---

## 🧪 Phase 3: Testing Infrastructure

### 3.1 Frontend Tests

**Add Dependencies**:
```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "happy-dom": "^12.0.0",
    "@vitest/ui": "^1.0.0"
  }
}
```

**Create**:
- `frontend/vitest.config.ts`
- `frontend/src/test/setup.ts`
- `frontend/src/test/utils.tsx`

**Test Priorities**:
1. Component rendering tests
2. Form validation tests
3. Polling hook tests (**CRITICAL**)
4. API service tests

---

### 3.2 Backend Tests

**Add Dependencies**:
```txt
pytest==7.4.0
pytest-asyncio==0.21.0
pytest-cov==4.1.0
httpx==0.24.0
```

**Create**:
- `backend/pytest.ini`
- `backend/conftest.py`
- `backend/tests/test_agents.py`
- `backend/tests/test_job_manager.py`
- `backend/tests/test_api_routes.py`

---

## 🔴 Phase 4: Large File Refactoring

### 4.1 JourneyMapPage.tsx (~35 KB) - HIGH PRIORITY

**Strategy**: Extract into components

**Target**:
```
pages/JourneyMapPage.tsx (orchestrator, ~150 lines)
components/journey/
  ├── JourneyHeader.tsx
  ├── JourneyOverview.tsx
  ├── PersonaSection.tsx
  ├── PhaseTimeline.tsx
  ├── InsightsPanel.tsx
  └── ExportControls.tsx
```

---

### 4.2 HomePage.tsx (~31 KB) - HIGH PRIORITY

**Strategy**: Extract sections into components

**Target**:
```
pages/HomePage.tsx (orchestrator, ~200 lines)
components/home/
  ├── HeroSection.tsx
  ├── FeaturesSection.tsx
  ├── HowItWorks.tsx
  ├── TestimonialsSection.tsx
  ├── PricingSection.tsx
  └── CTASection.tsx
```

---

### 4.3 CreateJourneyPage.tsx (~27 KB) - MEDIUM PRIORITY

**Strategy**: Extract form sections

**Target**:
```
pages/CreateJourneyPage.tsx (orchestrator, ~200 lines)
components/journey/
  ├── JourneyFormFields.tsx
  ├── PersonaSelector.tsx
  ├── PhaseSelector.tsx
  ├── FileUploadSection.tsx
  ├── ProgressTracker.tsx
  └── JourneySubmitButton.tsx
```

---

## 🚨 Critical Constraints Reminder

### FORBIDDEN CHANGES ❌
1. **CrewAI agent logic** - Do not modify agent files
2. **8-step workflow sequence** - Must stay 1-8
3. **Polling interval** (3 seconds) - Frontend depends on it
4. **Database throttle** (10 seconds) - Performance optimization
5. **UI aesthetics** - Icons, colors, design frozen
6. **Progress callback pattern** - Job manager depends on it
7. **Job ID format** (UUID) - Security requirement

### REQUIRED TESTING ✅
Before refactoring each file:
1. Add tests for existing functionality
2. Run tests (must pass)
3. Refactor
4. Run tests again (must still pass)
5. Manual testing
6. Deploy to staging first

---

## 📈 Success Metrics

### Code Quality
- [ ] No file >500 lines
- [ ] All pages <200 lines (orchestrators only)
- [ ] Components <150 lines each
- [ ] 60%+ test coverage (goal)

### Organization
- [ ] Clean root directory (<10 files)
- [ ] Logical folder structure
- [ ] Clear component hierarchy
- [ ] Well-named files

### Functionality
- [ ] All features working identically
- [ ] CrewAI workflow unchanged
- [ ] Polling mechanism intact
- [ ] UI/UX identical
- [ ] Performance unchanged or better

---

## 🗓️ Execution Timeline

### ✅ Session 1 (Completed)
- [x] UI redesign with Figma AI patterns
- [x] Add Windsurf MCP configuration
- [x] Add Figma AI Code reference
- [x] Document CrewAI workflow
- [x] Document polling architecture
- [x] Commit and push changes

### ⏳ Session 2 (Current)
- [x] Transfer documentation to correct location
- [ ] Organize root directory (move MD files)
- [ ] Add test infrastructure
- [ ] Update .gitignore if needed

### 📅 Session 3 (Future)
- [ ] JourneyMapPage refactoring
- [ ] HomePage refactoring
- [ ] Write tests for refactored components

### 📅 Session 4 (Future)
- [ ] CreateJourneyPage refactoring
- [ ] job_manager.py refactoring (if needed)
- [ ] Final testing and deployment

---

## ⚠️ Special Notes

### Figma AI Code Folder
**Status**: Reference only - will NOT be merged to main  
**Purpose**: Visual design reference for UI implementation  
**Location**: Root level  
**Action**: Keep in feature branch, exclude from main merge

---

**Created**: 2025-01-18  
**Status**: In Progress  
**Version**: 1.0
