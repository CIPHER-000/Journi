# 📚 Journi Documentation Index

**Project**: Journi - AI-Powered Customer Journey Mapping  
**Last Updated**: 2025-01-18

---

## 🎯 Quick Links

| Document | Purpose | Status |
|----------|---------|--------|
| [CREWAI_WORKFLOW_DOCUMENTATION.md](./CREWAI_WORKFLOW_DOCUMENTATION.md) | Complete CrewAI workflow guide | ✅ Complete |
| [POLLING_ARCHITECTURE.md](./POLLING_ARCHITECTURE.md) | HTTP polling system documentation | ✅ Complete |
| [REFACTORING_PLAN.md](./REFACTORING_PLAN.md) | Step-by-step refactoring plan | ✅ Complete |
| [CURRENT_STATE_ASSESSMENT.md](./CURRENT_STATE_ASSESSMENT.md) | Project state assessment | ✅ Complete |

---

## 🤖 CrewAI Workflow

**[CREWAI_WORKFLOW_DOCUMENTATION.md](./CREWAI_WORKFLOW_DOCUMENTATION.md)**

Complete documentation of the 8-step AI agent workflow:
1. Context Analysis
2. Persona Creation
3. Journey Mapping
4. Research Integration
5. Quote Generation
6. Emotion Validation
7. Output Formatting
8. Quality Assurance

**⚠️ CRITICAL**: This workflow is fully functional. Do not modify without tests.

---

## 🔄 Real-Time Progress Tracking

**[POLLING_ARCHITECTURE.md](./POLLING_ARCHITECTURE.md)**

HTTP polling-based real-time progress system:
- Frontend polls every 3 seconds
- Backend saves to DB every 10 seconds (throttled)
- In-memory caching with database persistence
- Recovery mechanism on restart

**Architecture**: Pure HTTP polling (WebSocket code commented for future use)

---

## 🔄 Refactoring Plan

**[REFACTORING_PLAN.md](./REFACTORING_PLAN.md)**

Detailed plan for project cleanup and restructuring:
- Root directory organization
- Large file refactoring strategy
- Testing infrastructure setup
- Timeline and success metrics

**Current Phase**: Documentation & Organization

---

## 📊 Project Assessment

**[CURRENT_STATE_ASSESSMENT.md](./CURRENT_STATE_ASSESSMENT.md)**

Comprehensive project analysis:
- UI redesign progress
- Infrastructure improvements
- Current structure
- Next steps

**Status**: Active development with recent UI improvements

---

## 📁 Project Structure

### Current Organization

```
Journi/
├── docs/ (📚 this directory)
│   ├── README.md (this file)
│   ├── CREWAI_WORKFLOW_DOCUMENTATION.md
│   ├── POLLING_ARCHITECTURE.md
│   ├── REFACTORING_PLAN.md
│   └── CURRENT_STATE_ASSESSMENT.md
├── backend/
│   ├── main.py (FastAPI application)
│   └── src/
│       ├── agents/ (8 CrewAI agents)
│       ├── services/ (job_manager, auth, usage)
│       ├── models/
│       ├── routes/
│       └── middleware/
├── frontend/
│   ├── src/
│   │   ├── pages/ (13 pages)
│   │   ├── components/
│   │   ├── services/
│   │   └── hooks/
│   └── package.json
├── Figma AI Code/ (⚠️ design reference - won't merge to main)
└── (various MD files - to be organized)
```

---

## 🚨 Critical Constraints

### Do NOT Modify ❌
1. **CrewAI Agents** - All 8 agents and workflow sequence
2. **Polling Logic** - 3-second interval, HTTP-based
3. **UI Aesthetics** - Icons, colors, design elements
4. **Progress Callbacks** - Job manager depends on them
5. **Database Schema** - job_id, status tracking

### Modification Rules ⚠️
1. **Always add tests first** - Before any refactoring
2. **Reference Figma AI Code** - For any UI changes
3. **Preserve functionality** - Nothing should break
4. **Ask before risky changes** - Especially CrewAI/polling
5. **Use Playwright MCP** - For best practices research

---

## 🧪 Testing Status

### Frontend
- ❌ No test infrastructure yet
- 🎯 Goal: Add vitest + testing-library

### Backend
- ❌ No pytest setup yet
- 🎯 Goal: Add pytest + coverage

**Priority**: Add testing infrastructure before refactoring

---

## 📦 Large Files to Refactor

| File | Size | Priority | Strategy |
|------|------|----------|----------|
| JourneyMapPage.tsx | ~35 KB | 🔴 HIGH | Extract components |
| HomePage.tsx | ~31 KB | 🔴 HIGH | Extract sections |
| CreateJourneyPage.tsx | ~27 KB | 🟡 MEDIUM | Extract form components |
| job_manager.py | 32.9 KB | 🟡 MEDIUM | Split into modules |

---

## 🎯 Next Steps

### Immediate (This Session)
1. ✅ Transfer documentation - Complete
2. ⏳ Organize root directory
3. ⏳ Add test infrastructure
4. ⏳ Update .gitignore if needed

### After Current Session
1. Commit and push changes
2. Begin large file refactoring
3. Add comprehensive tests
4. Staging deployment

---

## 🔗 External Resources

- [CrewAI Documentation](https://docs.crewai.com/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Vitest Documentation](https://vitest.dev/)

---

## 📝 Documentation To Be Organized

These files will be moved from root to appropriate subdirectories:

### AI Assistants
- CLAUDE.md
- WARP.md
- gpt5.md
- gpt5_analysis.md
- gpt5_collaboration.md

### Guides
- FIX_AUTH_GUIDE.md

### Fixes
- JOURNEY_FIXES_SUMMARY.md
- JOURNEY_NULL_REFERENCE_FIX.md

### Setup
- MIGRATION_INSTRUCTIONS.md

---

**Maintained By**: Windsurf Cascade  
**Version**: 1.0  
**Last Updated**: 2025-01-18
