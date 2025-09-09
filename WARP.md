# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Journi is an AI-powered web application that generates professional-grade customer journey maps using CrewAI's multi-agent orchestration framework. The application coordinates 8 specialized AI agents through a collaborative workflow to analyze business context, create personas, map journeys, integrate research, and generate comprehensive customer journey visualizations.

## Tech Stack & Architecture

**Frontend (React + TypeScript)**
- React 18 with TypeScript and Vite for development
- Tailwind CSS for styling, Framer Motion for animations
- React Router for navigation, Context API for state management
- Supabase integration for authentication and data persistence

**Backend (Python FastAPI + CrewAI)**
- FastAPI backend with CrewAI multi-agent orchestration
- 8 specialized agents: Context, Persona, Journey, Research, Quote, Emotion, Formatting, QA
- WebSocket support for real-time progress updates
- Authentication middleware with JWT tokens
- File processing for research documents (PDF, DOCX, CSV, TXT)

**Deployment**
- Frontend: Netlify (https://journi-frontend.netlify.app)
- Backend: Render (https://journi-backend.onrender.com)

## Development Commands

### Frontend Development
```bash
# Install frontend dependencies
npm run install:frontend

# Start frontend development server (http://localhost:5173)
npm run dev
# or
npm run dev:frontend

# Build frontend for production
npm run build

# Preview production build
npm run preview

# Lint TypeScript/React code
npm run lint --workspace=frontend
```

### Backend Development
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your API keys (OPENAI_API_KEY, SUPABASE_URL, etc.)

# Run backend server (http://localhost:8000)
python run.py

# Run with uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Full Stack Development
```bash
# Install all dependencies
npm run install:all

# Test backend connection
curl http://localhost:8000/health

# Test frontend-backend integration
curl http://localhost:8000/api/journey/status/test-job-id
```

## CrewAI Agent Architecture

The application uses an 8-step CrewAI workflow with specialized agents:

1. **Context Agent** (`context_agent.py`) - Analyzes business context and goals
2. **Persona Agent** (`persona_agent.py`) - Creates detailed customer personas  
3. **Journey Agent** (`journey_agent.py`) - Maps customer journey phases and touchpoints
4. **Research Agent** (`research_agent.py`) - Integrates uploaded research documents
5. **Quote Agent** (`quote_agent.py`) - Generates authentic customer quotes
6. **Emotion Agent** (`emotion_agent.py`) - Validates emotions and pain points
7. **Formatting Agent** (`formatting_agent.py`) - Formats professional outputs
8. **QA Agent** (`qa_agent.py`) - Performs quality assurance and refinement

**CrewCoordinator** (`crew_coordinator.py`) orchestrates the entire workflow with:
- Progress callbacks for real-time WebSocket updates
- Error handling and job cancellation
- User-specific API key management (BYOK support)
- Structured output parsing

## Key Directories

```
backend/src/
├── agents/           # CrewAI agent implementations
├── models/          # Pydantic data models (Journey, Job, Auth)
├── services/        # Business logic (JobManager, AuthService, UsageService)
├── routes/          # API route handlers (auth, journey endpoints)
└── middleware/      # Authentication middleware

frontend/src/
├── components/      # React components (JourneyForm, Visualization, etc.)
├── pages/          # Page components (Dashboard, CreateJourney, etc.)
├── context/        # React context providers (Auth, Journey)
├── services/       # API clients (AgentService, API utilities)
├── hooks/          # Custom React hooks (useJobProgress)
└── types/          # TypeScript type definitions
```

## API Integration

**Core Endpoints:**
- `POST /api/journey/create` - Initiate CrewAI workflow
- `GET /api/journey/status/{job_id}` - Get real-time job progress
- `GET /api/journey/{journey_id}` - Retrieve completed journey map
- `WebSocket /ws/progress/{job_id}` - Live progress updates
- `POST /api/files/upload` - Upload research documents

**Authentication:**
- JWT-based authentication with Supabase
- Protected routes require valid Bearer token
- BYOK (Bring Your Own Key) support for OpenAI API

## WebContainer Limitations

This project has specific WebContainer compatibility considerations:

- **Frontend**: Full WebContainer support with Node.js and Vite
- **Backend**: Requires full Python environment with pip for CrewAI dependencies
- **Development**: Frontend gracefully handles backend unavailability with connection status checking
- **Mock Data**: Frontend includes mock data fallbacks when backend is unavailable

## Environment Variables

**Frontend (.env.development):**
- `VITE_BACKEND_URL` - Backend API URL
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

**Backend (.env):**
- `OPENAI_API_KEY` - OpenAI API key for CrewAI agents
- `SUPABASE_URL` - Supabase project URL  
- `SUPABASE_SERVICE_KEY` - Supabase service role key
- `JWT_SECRET` - JWT signing secret
- `ENVIRONMENT` - deployment environment (development/production)

## Real-time Progress Tracking

The application features sophisticated real-time progress tracking:

- **WebSocket Connections**: Live updates during CrewAI workflow execution
- **Progress Callbacks**: Each agent step reports progress via callback system
- **Job Management**: Centralized job tracking with status, progress, and results
- **Connection Management**: Robust WebSocket connection handling with cleanup

## Testing & Debugging

**Backend Health Check:**
```bash
curl http://localhost:8000/health
# Should return: {"status": "healthy", "timestamp": "...", "service": "Journi CrewAI Backend"}
```

**Frontend Development:**
```bash
# Check environment variables
console.log('VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL)

# Test backend connection from frontend
# Check browser network tab for API calls to /health endpoint
```

**CrewAI Workflow Debugging:**
- Enable verbose logging in CrewCoordinator for agent interactions
- Check individual agent outputs in workflow execution
- Monitor WebSocket messages for progress updates
- Review job status transitions in JobManager

## Common Development Tasks

**Adding New Agent:**
1. Create agent class in `backend/src/agents/`
2. Add agent to CrewCoordinator workflow
3. Update progress tracking with new step
4. Test agent integration in workflow

**Modifying Journey Form:**
1. Update TypeScript types in `frontend/src/types/`
2. Modify form components in `frontend/src/components/`
3. Update backend models in `backend/src/models/journey.py`
4. Adjust agent inputs in CrewCoordinator

**Adding Export Format:**
1. Add export logic to `main.py` export endpoints
2. Update frontend export options in `ExportOptions.tsx`
3. Test export functionality with real journey data

## Deployment Considerations

- Frontend builds to static assets for Netlify deployment
- Backend requires Python environment with CrewAI dependencies
- WebSocket connections need proper CORS configuration
- Environment-specific API URLs and authentication configuration
- Database migrations handled through Supabase interface
