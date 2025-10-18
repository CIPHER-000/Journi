# 🤖 CrewAI Workflow Documentation

**System**: Journi - AI-Powered Customer Journey Mapping  
**Architecture**: HTTP Polling-Based Real-Time Progress Tracking  
**Last Updated**: 2025-01-18

---

## 🎯 Overview

The CrewAI workflow is an **8-step sequential process** that generates comprehensive customer journey maps using multiple specialized AI agents. Each agent performs a specific task and passes its output to the next agent in the pipeline.

**Critical**: This workflow is **fully functional and battle-tested**. Any modifications must preserve this exact flow and behavior.

---

## 📊 Workflow Architecture

```
User Submits Form
       ↓
[Job Manager] Creates Job → Saves to DB → Starts Workflow
       ↓
[CrewCoordinator] Executes 8 Sequential Steps
       ↓
Each Step: Agent → Task → Crew → Execute → Result
       ↓
[Job Manager] Updates Progress → Saves to DB
       ↓
[Frontend] Polls Every 3s → Displays Progress
       ↓
Final Result → Displayed to User
```

---

## 🔄 The 8-Step Workflow

### **Step 1: Context Analysis** 🧠
**Agent**: `ContextAgent`  
**File**: `backend/src/agents/context_agent.py` (2.2 KB)

**Purpose**: Analyze business context, industry, and objectives

**Input**:
- `form_data.industry`
- `form_data.business_goals`
- `form_data.additional_context`

**Output**: `context_analysis` (string)
- Industry insights
- Business objectives breakdown
- Market context

**Duration**: ~45 seconds

---

### **Step 2: Persona Creation** 👥
**Agent**: `PersonaAgent`  
**File**: `backend/src/agents/persona_agent.py` (2.8 KB)

**Purpose**: Create detailed customer personas

**Input**:
- `form_data` (user input)
- `context_analysis` (from Step 1)

**Output**: `personas` (string)
- Persona profiles
- Demographics
- Goals and motivations
- Pain points

**Duration**: ~60 seconds

---

### **Step 3: Journey Mapping** 🗺️
**Agent**: `JourneyAgent`  
**File**: `backend/src/agents/journey_agent.py` (2.9 KB)

**Purpose**: Map customer journey phases and touchpoints

**Input**:
- `form_data`
- `context_analysis` (Step 1)
- `personas` (Step 2)

**Output**: `journey_phases` (string)
- Journey phases (Awareness, Consideration, Purchase, etc.)
- Touchpoints for each phase
- Customer actions

**Duration**: ~75 seconds

---

### **Step 4: Research Integration** 📊
**Agent**: `ResearchAgent`  
**File**: `backend/src/agents/research_agent.py` (9.9 KB) ⚠️ **LARGEST**

**Purpose**: Integrate uploaded research files and extract insights

**Input**:
- `form_data` (includes uploaded files)
- `context_analysis` (Step 1)
- `personas` (Step 2)
- `journey_phases` (Step 3)

**Output**: `research_insights` (string)
- File content analysis (PDF, DOCX, CSV, TXT)
- Key insights extracted
- Data integration with personas/journey

**Duration**: ~30 seconds (depends on file size)

**File Processing**:
- PDF: `pdfplumber`, `PyMuPDF`
- DOCX: `python-docx`
- CSV: `pandas`
- TXT: direct read

---

### **Step 5: Quote Generation** 💬
**Agent**: `QuoteAgent`  
**File**: `backend/src/agents/quote_agent.py` (2.9 KB)

**Purpose**: Generate authentic customer quotes

**Input**:
- `form_data`
- `context_analysis` (Step 1)
- `personas` (Step 2)
- `journey_phases` (Step 3)
- `research_insights` (Step 4)

**Output**: `customer_quotes` (string)
- Persona-specific quotes
- Voice and tone matching
- Journey phase quotes

**Duration**: ~45 seconds

---

### **Step 6: Emotion Validation** ❤️
**Agent**: `EmotionAgent`  
**File**: `backend/src/agents/emotion_agent.py` (2.9 KB)

**Purpose**: Validate emotions and psychological drivers

**Input**:
- `form_data`
- `context_analysis` (Step 1)
- `personas` (Step 2)
- `journey_phases` (Step 3)
- `research_insights` (Step 4)
- `customer_quotes` (Step 5)

**Output**: `emotion_validation` (string)
- Emotional journey mapping
- Pain point validation
- Psychological drivers

**Duration**: ~40 seconds

---

### **Step 7: Output Formatting** 📝
**Agent**: `FormattingAgent`  
**File**: `backend/src/agents/formatting_agent.py` (3.4 KB)

**Purpose**: Format all outputs into structured data

**Input**:
- `form_data`
- All previous outputs (Steps 1-6)

**Output**: `formatted_output` (string)
- Structured journey map
- Professional formatting
- Ready for presentation

**Duration**: ~35 seconds

---

### **Step 8: Quality Assurance** ✅
**Agent**: `QAAgent`  
**File**: `backend/src/agents/qa_agent.py` (3.3 KB)

**Purpose**: Final quality check and refinement

**Input**:
- `form_data`
- `formatted_output` (Step 7)

**Output**: `final_output` (string)
- Quality-checked journey map
- Final refinements
- Complete and ready

**Duration**: ~40 seconds

**Total Workflow Duration**: ~6-7 minutes

---

## 🔧 Technical Implementation

### File: `backend/src/agents/crew_coordinator.py` (17.3 KB)

**Class**: `CrewCoordinator`

**Key Method**: `execute_workflow(form_data, progress_callback, job_id)`

**Pattern for Each Step**:
```python
# 1. Update progress
if progress_callback:
    await progress_callback(step_num, "Step Name", "Starting message...")

# 2. Create agent task
task = agent.create_task(form_data, *previous_outputs)

# 3. Create crew
crew = Crew(
    agents=[agent.agent],
    tasks=[task],
    verbose=True
)

# 4. Execute (runs in thread to avoid blocking)
try:
    result = await asyncio.to_thread(crew.kickoff)
    output = str(result)
    
    # Update progress during execution
    if progress_callback:
        await progress_callback(step_num, "Step Name", "Progress message...")
        
except Exception as e:
    logger.error(f"Error in {step_name}: {str(e)}")
    if progress_callback:
        await progress_callback(step_num, "Step Name", f"Error: {str(e)}")
    raise RuntimeError(f"{step_name} failed: {str(e)}")

# 5. Final progress update
if progress_callback:
    await progress_callback(step_num, "Step Name", "Completed successfully")
```

**Error Handling**:
- Each step wrapped in try-except
- Errors logged and propagated
- Progress callback receives error messages
- Workflow stops on error

---

## 🔄 Agent Configuration

### LLM Configuration
```python
self.llm = ChatOpenAI(
    model=os.getenv("OPENAI_MODEL", "gpt-4o"),
    temperature=0.7,
    openai_api_key=api_key  # User's BYOK or system key
)
```

**BYOK Support**: Users can bring their own OpenAI API key
- Stored in `user.openai_api_key`
- Falls back to system key if not provided

### Agent Initialization
All 8 agents initialized in `__init__`:
```python
self.context_agent = ContextAgent(self.llm)
self.persona_agent = PersonaAgent(self.llm)
self.journey_agent = JourneyAgent(self.llm)
self.research_agent = ResearchAgent(self.llm)
self.quote_agent = QuoteAgent(self.llm)
self.emotion_agent = EmotionAgent(self.llm)
self.formatting_agent = FormattingAgent(self.llm)
self.qa_agent = QAAgent(self.llm)
```

---

## ⚠️ Critical Constraints

### DO NOT MODIFY ❌
1. **Step sequence** - Must remain 1-8 in exact order
2. **Agent dependencies** - Each step depends on previous outputs
3. **Progress callback pattern** - Multiple calls per step required for UX
4. **Error handling** - Must catch and report errors properly
5. **Threading pattern** - `asyncio.to_thread(crew.kickoff)` prevents blocking

### CAN MODIFY (With Care) ⚠️
1. **Progress messages** - Text can be improved
2. **Parsing logic** - `_parse_final_output` can be enhanced
3. **Logging** - Can add more detailed logs
4. **Agent prompts** - Inside individual agent files (careful!)

### FORBIDDEN ❌
1. **Removing steps** - All 8 required
2. **Changing step order** - Dependencies will break
3. **Removing progress callbacks** - Frontend depends on them
4. **Changing error propagation** - Breaks error reporting

---

## 📈 Performance Characteristics

| Step | Duration | API Calls | Token Usage |
|------|----------|-----------|-------------|
| 1. Context | ~45s | 1-2 | ~500-1000 |
| 2. Persona | ~60s | 1-3 | ~1000-1500 |
| 3. Journey | ~75s | 1-3 | ~1500-2000 |
| 4. Research | ~30s | 1-2 | ~500-1000 |
| 5. Quotes | ~45s | 1-2 | ~800-1200 |
| 6. Emotion | ~40s | 1-2 | ~800-1200 |
| 7. Formatting | ~35s | 1 | ~500-800 |
| 8. QA | ~40s | 1 | ~500-800 |
| **Total** | **~6-7 min** | **8-18** | **~6K-10K** |

---

## 🎯 Integration Points

### Called By
`backend/src/services/job_manager.py` → `_run_agent_workflow()`

### Calls To
- Individual agent files (8 agents)
- `ChatOpenAI` (LangChain OpenAI integration)
- `Crew` (CrewAI orchestration)

---

## ✅ Summary

**Status**: ✅ Fully Functional  
**Architecture**: Sequential 8-step pipeline  
**Progress Tracking**: HTTP Polling (every 3s)  
**Duration**: ~6-7 minutes  
**Error Handling**: Step-level with propagation  
**Stability**: High (do not modify without tests)

**Last Reviewed**: 2025-01-18  
**Documentation Version**: 1.0
