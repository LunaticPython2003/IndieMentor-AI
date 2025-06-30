# IndieMentor AI

A revolutionary platform that allows creators, educators, and professionals to clone themselves into AI-powered mentors using voice, video, and document training. Users can monetize their expertise by creating personalized AI mentors that provide 24/7 guidance and support.

## 🚀 Features

### For Creators
- **AI Mentor Creation**: Upload videos, audio, and documents to train your AI mentor
- **Voice & Video Cloning**: Advanced AI captures your unique voice and appearance with Tavus integration
- **Monetization**: Set subscription prices and earn passive income
- **Dashboard**: Track subscribers, revenue, and conversations
- **Real-time Analytics**: Monitor mentor performance and engagement
- **Video Training**: Create lifelike AI replicas for face-to-face conversations

### For Users
- **AI Conversations**: Chat with AI mentors via text, voice, and video
- **Video Chat**: Face-to-face conversations with AI mentor replicas powered by Tavus
- **Subscription Management**: Access premium mentors with monthly subscriptions
- **Personalized Learning**: Get tailored advice based on mentor expertise
- **24/7 Availability**: Learn from your favorite creators anytime

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Python FastAPI, Supabase (Database, Auth, Real-time)
- **AI Services**: Groq for text conversations, Tavus for video chat
- **UI Components**: Lucide React icons
- **Notifications**: React Hot Toast
- **Routing**: React Router DOM
- **Build Tool**: Vite

## 📜 Available Scripts

### Development
- `npm run start` - Start both frontend and backend concurrently
- `npm run dev:frontend` - Start only the frontend (Vite dev server)
- `npm run dev:backend` - Start only the backend (FastAPI server)
- `npm run dev` - Alias for `dev:frontend`

### Building
- `npm run build` - Build the frontend for production
- `npm run build:frontend` - Build the frontend for production
- `npm run build:backend` - Install backend dependencies

### Utilities
- `npm run install:backend` - Install Python dependencies
- `npm run lint` - Run ESLint on frontend code
- `npm run preview` - Preview the built frontend

## 🏗 Architecture

### Database Schema
- **profiles**: User accounts and creator information
- **mentors**: AI mentor configurations and metadata
- **subscriptions**: User subscriptions to mentors
- **conversations**: Chat history and messages

### Key Components
- **AuthContext**: Authentication and user management
- **ProtectedRoute**: Route protection for authenticated users
- **useMentors**: Hook for mentor CRUD operations
- **useConversations**: Hook for chat functionality

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.8+
- Supabase account

### Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd indiementor-ai
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit the `.env` file with your actual API keys:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GROQ_API_KEY=your_groq_api_key_here
VITE_TAVUS_API_KEY=your_tavus_api_key_here
JWT_SECRET_KEY=your_super_secret_jwt_key_for_development_12345
```

3. **Option 1: Quick Start (Recommended)**
   ```bash
   # Windows
   start.bat
   
   # macOS/Linux
   chmod +x start.sh
   ./start.sh
   
   # PowerShell
   .\start.ps1
   ```

4. **Option 2: Manual Setup**
   
   Install dependencies:
   ```bash
   # Frontend dependencies
   npm install
   
   # Backend dependencies
   cd mentor_agent
   pip install -r requirements.txt
   cd ..
   ```
   
   Start the application:
   ```bash
   # Start both frontend and backend
   npm run start
   
   # Or start them separately
   npm run dev:frontend  # Frontend on http://localhost:5173
   npm run dev:backend   # Backend on http://localhost:8001
   ```

5. Configure Supabase:
   - Create a new Supabase project
   - Run the migration file from `mentor_agent/supabase_schema.sql` in the Supabase SQL editor
   - Update `.env` with your Supabase URL and keys

6. Access the application:
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:8001
   - **API Documentation**: http://localhost:8001/docs

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor and run the migration file: `supabase/migrations/001_initial_schema.sql`
3. Copy your project URL and anon key to the `.env` file

## 📱 Usage

### Creating an AI Mentor

1. Sign up as a creator
2. Navigate to "Create Mentor"
3. Fill in basic information (name, title, description, expertise)
4. Upload training content (videos, audio, documents)
5. Launch your AI mentor

### Subscribing to Mentors

1. Browse available mentors
2. View mentor profiles and expertise
3. Subscribe to access chat functionality
4. Start conversations with AI mentors

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- User authentication via Supabase Auth
- Protected routes for sensitive operations
- Secure API endpoints with proper authorization

## 🎨 Design System

### Colors
- **Primary**: Blue gradient (#6366F1 to #5B21B6)
- **Secondary**: Green (#10B981)
- **Accent**: Orange (#F59E0B)

### Components
- Responsive design with mobile-first approach
- Consistent spacing using 8px grid system
- Smooth animations and micro-interactions
- Accessible color contrasts and typography

## 📈 Monetization

- Subscription-based model for mentor access
- Revenue sharing between platform and creators
- Built-in payment processing
- Analytics for tracking earnings

## 🔮 Future Enhancements

- **Advanced Video Features**: Group video sessions, screen sharing, and conversation recording
- **Enhanced Analytics**: Detailed performance metrics for video vs text conversations
- **Mobile App**: Native iOS and Android applications with video chat
- **API Integration**: Third-party integrations and webhooks
- **Multi-language Support**: Video conversations in multiple languages
- **Advanced AI Features**: Emotion recognition and adaptive conversation flow

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@indiementor.ai or join our Discord community.

---

Built with ❤️ by the IndieMentor AI team