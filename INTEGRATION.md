# Project Integration Guide

## 🏗️ Architecture Overview

This project is a full-stack AI mentor application with the following structure:

```
tavus/                          # Project root
├── src/                        # Frontend React application
│   ├── components/            # React components
│   ├── contexts/              # React contexts (Auth, etc.)
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Service layers and utilities
│   │   ├── authService.ts     # Authentication service
│   │   ├── mentorService.ts   # Mentor CRUD operations
│   │   ├── notesService.ts    # Notes and handbook service
│   │   ├── tavusService.ts    # Video chat integration
│   │   └── groqAI.ts          # AI chat service
│   └── pages/                 # React pages/routes
├── mentor_agent/              # Backend FastAPI application
│   ├── routes/                # API route handlers
│   │   ├── auth.py            # Authentication endpoints
│   │   ├── chat.py            # Chat endpoints
│   │   ├── setup.py           # User setup endpoints
│   │   └── upload.py          # File upload endpoints
│   ├── models/                # Pydantic data models
│   ├── memory/                # Memory storage systems
│   ├── states/                # AI state management
│   ├── main.py                # FastAPI application entry
│   └── requirements.txt       # Python dependencies
├── public/                    # Static frontend assets
├── package.json               # Node.js dependencies and scripts
├── vite.config.ts             # Vite configuration with proxy
├── .env                       # Environment variables
├── .env.example               # Environment template
├── start.bat                  # Windows startup script
├── start.sh                   # Unix/Linux startup script
└── start.ps1                  # PowerShell startup script
```

## 🔗 Integration Points

### 1. API Communication
- **Frontend**: Runs on http://localhost:5173
- **Backend**: Runs on http://localhost:8001
- **Proxy**: Vite dev server proxies `/IndieMentor/api/*` to backend

### 2. Service Layer Architecture
All frontend services use the same pattern:
```typescript
const API_BASE_URL = typeof window !== 'undefined' && window.location.origin.includes('localhost') 
  ? '/IndieMentor/api/v1'  // Use proxy in development
  : 'http://localhost:8001/IndieMentor/api/v1';  // Direct in production
```

### 3. Authentication Flow
1. User registers/logs in via frontend
2. Frontend sends credentials to `/IndieMentor/api/v1/auth/login`
3. Backend validates with Supabase and returns JWT
4. Frontend stores JWT and includes in subsequent requests
5. Backend validates JWT for protected routes

### 4. Data Flow
```
Frontend (React) 
    ↕ HTTP/JSON
Backend (FastAPI) 
    ↕ SQL/Auth
Supabase (Database/Auth)
    ↕ API calls
External APIs (Groq, Tavus)
```

## 🚀 Running the Application

### Quick Start
```bash
# Windows
start.bat

# Unix/Linux/macOS
chmod +x start.sh && ./start.sh

# PowerShell
.\start.ps1
```

### Manual Start
```bash
# Start both services
npm run start

# Or start individually
npm run dev:frontend    # Frontend only
npm run dev:backend     # Backend only
```

## 🔧 Configuration

### Environment Variables (.env)
```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT
JWT_SECRET_KEY=your_jwt_secret
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=10080

# AI Services
GROQ_API_KEY=your_groq_api_key
VITE_TAVUS_API_KEY=your_tavus_api_key

# Ports (optional)
API_PORT=8001
FRONTEND_PORT=5173
```

### Vite Proxy Configuration
The `vite.config.ts` handles API proxying:
```typescript
server: {
  proxy: {
    '/IndieMentor/api': {
      target: 'http://localhost:8001',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

## 🔍 Troubleshooting

### Common Issues

1. **Backend not starting**
   - Check if Python dependencies are installed: `cd mentor_agent && pip install -r requirements.txt`
   - Verify environment variables in `.env`
   - Check if port 8001 is available

2. **Frontend not connecting to backend**
   - Ensure backend is running on port 8001
   - Check Vite proxy configuration
   - Verify API_BASE_URL in service files

3. **Authentication issues**
   - Check Supabase configuration
   - Verify JWT secret key
   - Ensure `.env` file exists and is properly configured

4. **CORS errors**
   - Backend already configured for CORS with `allow_origins=["*"]`
   - If issues persist, check FastAPI CORS middleware configuration

### Debugging

1. **Backend logs**: Check terminal running the FastAPI server
2. **Frontend logs**: Check browser developer console
3. **API documentation**: Visit http://localhost:8001/docs when backend is running
4. **Network requests**: Use browser dev tools Network tab

## 📦 Dependencies

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- React Router (routing)
- JWT decode (authentication)

### Backend
- FastAPI (web framework)
- Supabase (database & auth)
- JWT (authentication)
- Uvicorn (ASGI server)

## 🔄 Development Workflow

1. Make changes to frontend or backend code
2. Both servers auto-reload on file changes
3. Use http://localhost:5173 for development
4. API calls are automatically proxied to backend
5. Check http://localhost:8001/docs for API documentation
