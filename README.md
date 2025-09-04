# Journi: AI-Powered Customer Journey Mapping

## Project Structure

```
journi/
├── frontend/          # React + TypeScript frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── backend/           # Python FastAPI backend with CrewAI
│   ├── src/
│   ├── requirements.txt
│   └── run.py
└── package.json       # Root workspace configuration
```

## Quick Start

### Frontend Development (WebContainer Compatible)
```bash
# Install frontend dependencies
npm run install:frontend

# Start frontend development server
npm run dev
# or
npm run dev:frontend
```

The frontend will run on `http://localhost:5173` with mock data.

### Backend Development (Requires Full Python Environment)

**Note**: The Python backend cannot run in WebContainer due to pip/third-party package limitations.

For local development with full Python support:

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your API keys

# Start backend server
python run.py
```

The backend will run on `http://localhost:8000`.

## Deployed URLs

- **Frontend**: https://journi-frontend.netlify.app
- **Backend**: https://journi-backend.onrender.com

## Project Requirements Proposal (PRP) - Updated for CrewAI Architecture

### One-sentence idea
An AI-powered web application that rapidly generates professional-grade customer journey maps using CrewAI's multi-agent orchestration framework to coordinate specialized AI agents through an 8-step collaborative workflow.

### User journey
1. **Access Application**: The user navigates to the Journi web application.
2. **Initiate Creation**: The user clicks on "Create Journey Map" to begin a new project.
3. **Provide Context**: The user fills out a form, specifying the industry, business goals, target persona types, and desired journey phases.
4. **Upload Research (Optional)**: The user can upload relevant research files (PDF, DOCX, CSV, TXT) to provide additional context for the AI agents.
5. **Generate Map**: The user submits the form, which initiates the CrewAI-orchestrated 8-step agent workflow in the background.
6. **Monitor Progress**: The user views a real-time processing status page, tracking the agents' progress through each step of the collaborative generation process.
7. **Receive Notification**: The user is notified once the agent crew completes the journey map generation.
8. **View Dashboard**: The user accesses the dashboard to see a list of all their generated journey maps.
9. **Explore Map**: The user selects a specific journey map to view its detailed visualization, including personas, phases, touchpoints, emotions, pain points, opportunities, and customer quotes.
10. **Export Map**: The user can choose to export the journey map as a PDF report, PNG image, or PowerPoint slide deck.
11. **Revisit/Manage**: The user can revisit past maps or manage their collection on the dashboard.

### Target audience
UX Designers, Product Managers, Marketing Teams, and Researchers—anyone needing deep customer insights fast, without hiring an entire consulting team.

### List of core features
* **Input Form for Users**: A comprehensive form to collect essential project details such as industry, business goals, target persona types, and selected journey phases.
* **CrewAI Agent Orchestration**: Implementation of an 8-step collaborative AI workflow using CrewAI's multi-agent framework, with specialized agents for Context Analysis, Persona Creation, Journey Mapping, Research Integration, Quote Generation, Emotion Validation, Output Formatting, and Quality Assurance.
* **Research File Parsing**: Capability to accept and extract usable text from uploaded research documents in PDF, DOCX, CSV, and TXT formats for agent processing.
* **Journey Map Visualizer**: An interactive and clean visual representation of the generated journey map, detailing phases, actions, barriers, emotions, quotes, and persona highlights.
* **Result Dashboard**: A centralized dashboard where users can view, download, and revisit all their previously generated journey maps, with each map linked to its original input parameters.
* **Agent Job Management**: A system to manage and display the status of CrewAI agent workflows (Queued → Processing → Ready), with real-time progress tracking and notifications upon completion.
* **Export Options**: Functionality to export the generated journey maps into various formats, including PDF reports, PNG images, and PowerPoint slide decks.
* **Persona Cards**: Detailed, visually appealing cards for each agent-generated persona, outlining their demographics, goals, pain points, motivations, and a representative quote.
* **Insights Panel**: A dedicated section presenting key findings, actionable recommendations, and highlights of the emotional journey derived from the collaborative agent analysis.

### Suggested tools/stack
* **Frontend**: React, TypeScript, Framer Motion, React Router, Context API, Tailwind CSS
* **Build Tool**: Vite
* **AI Orchestration**: CrewAI framework for multi-agent coordination and task execution
* **Backend API**: FastAPI (Python) or Node.js/Express for CrewAI integration and job management
* **Agent Framework**: CrewAI with specialized agents for each workflow step
* **Database**: Supabase or PostgreSQL for persistent storage of user data, agent outputs, and generated journey maps
* **File Storage**: Supabase Storage or AWS S3 for uploaded research documents
* **Job Queue**: Redis or database-based queue for managing agent workflow execution
* **Real-time Updates**: WebSockets or Server-Sent Events for live progress tracking

### Design vibe
Modern, clean, and intuitive, aiming for an "Apple-level" aesthetic. The design will feature smooth animations, subtle gradient backgrounds, a professional and cohesive color scheme, and clear, readable typography. Emphasis will be placed on an intuitive user experience, responsive layouts across various devices, and overall visual appeal.

### Future features
* **Real-time Collaboration**: Enable multiple users to view and edit journey maps concurrently.
* **Advanced Agent Customization**: Allow users to configure agent behavior, add custom agents, or modify the workflow steps.
* **Integration with Analytics/CRM**: Connect with external data sources (e.g., Google Analytics, Salesforce) to enrich journey maps with real-world user data.
* **Advanced Analytics & Reporting**: Provide deeper analytical insights and customizable reporting options based on the agent-generated journey maps.
* **Customizable Templates**: Allow users to create, save, and reuse their own journey map templates and agent configurations.
* **Version Control**: Implement functionality to track changes and enable users to revert to previous versions of a journey map.
* **User Authentication & Management**: Develop a robust system for user login, registration, and profile management.
* **Enhanced Email Notifications**: Provide more detailed and customizable email notifications for agent workflow status updates and completion.
* **Additional Export Formats**: Expand export capabilities to include formats like SVG, JSON, or direct integration with specialized presentation tools.

## Architecture Overview

### Agent Workflow Structure
```
/backend/src/agents/
├── context_agent.py          # Step 1: Context Setting & Goal Definition
├── persona_agent.py          # Step 2: Persona Creation & Validation
├── journey_agent.py          # Step 3: Journey Phase Mapping
├── research_agent.py         # Step 4: Research Data Integration
├── quote_agent.py            # Step 5: Quote & Insight Generation
├── emotion_agent.py          # Step 6: Emotion & Pain Point Validation
├── formatting_agent.py       # Step 7: Professional Output Formatting
├── qa_agent.py              # Step 8: Quality Assurance & Refinement
└── crew_coordinator.py       # CrewAI orchestration and workflow management
```

### API Integration Points
- `POST /api/journey/create` - Initiate agent workflow
- `GET /api/journey/status/{job_id}` - Get real-time progress
- `GET /api/journey/{journey_id}` - Retrieve completed journey map
- `WebSocket /ws/progress/{job_id}` - Live progress updates

## Development Notes

### WebContainer Limitations
This project is designed to work in WebContainer (browser-based development environment) with the following constraints:
- Frontend runs fully in WebContainer with Node.js support
- Backend requires full Python environment with pip for CrewAI dependencies
- Mock data is used when backend is not available

### Environment Setup
- Frontend: Full WebContainer support with Vite and React
- Backend: Requires local Python environment or cloud deployment
- Integration: Frontend gracefully handles backend unavailability